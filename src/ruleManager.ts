import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface Rule {
    ruleId: string;
    ruleText: string;
    scope: 'global' | 'project' | 'language';
    languageScope?: string;
    projectPath?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export class RuleManager {
    private context: vscode.ExtensionContext;
    private mongoConnection: any = null;
    private localFilePath: string;
    private rules: Rule[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.localFilePath = path.join(
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || context.globalStorageUri.fsPath,
            '.copilot-memory.json'
        );
    }

    async initialize(): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilotMemory');
        const mongoUri = config.get<string>('mongodbUri');
        const fallbackToLocal = config.get<boolean>('fallbackToLocal', true);

        // Try to connect to MongoDB first
        if (mongoUri) {
            try {
                await this.connectToMongoDB(mongoUri);
                console.log('Connected to MongoDB');
            } catch (error) {
                console.warn('Failed to connect to MongoDB:', error);
                if (!fallbackToLocal) {
                    throw new Error('MongoDB connection failed and fallback is disabled');
                }
            }
        }

        // Load rules from appropriate source
        if (this.mongoConnection) {
            await this.loadRulesFromMongo();
        } else {
            await this.loadRulesFromLocal();
        }
    }

    private async connectToMongoDB(uri: string): Promise<void> {
        // For now, we'll simulate MongoDB connection
        // In a real implementation, you would use mongoose here
        try {
            // const mongoose = require('mongoose');
            // await mongoose.connect(uri);
            // this.mongoConnection = mongoose.connection;

            // Simulated connection for now
            this.mongoConnection = null; // Will fallback to local storage
        } catch (error) {
            throw error;
        }
    }

    private async loadRulesFromMongo(): Promise<void> {
        // Implementation would query MongoDB using mongoose
        // For now, fallback to local
        await this.loadRulesFromLocal();
    }

    private async loadRulesFromLocal(): Promise<void> {
        try {
            if (fs.existsSync(this.localFilePath)) {
                const data = fs.readFileSync(this.localFilePath, 'utf8');
                this.rules = JSON.parse(data).map((rule: any) => ({
                    ...rule,
                    createdAt: new Date(rule.createdAt),
                    updatedAt: new Date(rule.updatedAt)
                }));
            } else {
                this.rules = [];
            }
        } catch (error) {
            console.error('Failed to load rules from local file:', error);
            this.rules = [];
        }
    }

    private async saveRulesToLocal(): Promise<void> {
        try {
            const dir = path.dirname(this.localFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.localFilePath, JSON.stringify(this.rules, null, 2));
        } catch (error) {
            console.error('Failed to save rules to local file:', error);
            throw error;
        }
    }

    async addRule(
        ruleText: string,
        scope: 'global' | 'project' | 'language',
        languageScope?: string
    ): Promise<void> {
        const rule: Rule = {
            ruleId: crypto.randomUUID(),
            ruleText,
            scope,
            languageScope,
            projectPath: scope === 'project' ? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };

        this.rules.push(rule);

        if (this.mongoConnection) {
            // Save to MongoDB
            // await Rule.create(rule);
        } else {
            await this.saveRulesToLocal();
        }
    }

    async removeRule(ruleId: string): Promise<void> {
        this.rules = this.rules.filter(rule => rule.ruleId !== ruleId);

        if (this.mongoConnection) {
            // Remove from MongoDB
            // await Rule.findOneAndDelete({ ruleId });
        } else {
            await this.saveRulesToLocal();
        }
    }

    async getRules(scope?: 'global' | 'project' | 'language', languageId?: string): Promise<Rule[]> {
        let filteredRules = this.rules.filter(rule => rule.isActive);

        if (scope) {
            filteredRules = filteredRules.filter(rule => rule.scope === scope);
        }

        if (languageId) {
            filteredRules = filteredRules.filter(rule =>
                rule.scope !== 'language' || rule.languageScope === languageId
            );
        }

        // For project scope, filter by current workspace
        const currentProjectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (currentProjectPath) {
            filteredRules = filteredRules.filter(rule =>
                rule.scope !== 'project' || rule.projectPath === currentProjectPath
            );
        }

        return filteredRules;
    }

    async getActiveRulesForContext(languageId?: string): Promise<string[]> {
        const globalRules = await this.getRules('global');
        const projectRules = await this.getRules('project');
        const languageRules = languageId ? await this.getRules('language', languageId) : [];

        const allRules = [...globalRules, ...projectRules, ...languageRules];
        return allRules.map(rule => rule.ruleText);
    }
}
