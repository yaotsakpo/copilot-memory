import mongoose, { Schema, Document } from 'mongoose';

export interface IRule extends Document {
    ruleId: string;
    ruleText: string;
    scope: 'global' | 'project' | 'language';
    languageScope?: string;
    projectPath?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

const RuleSchema: Schema = new Schema({
    ruleId: {
        type: String,
        required: true,
        unique: true
    },
    ruleText: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        enum: ['global', 'project', 'language'],
        required: true
    },
    languageScope: {
        type: String,
        required: false
    },
    projectPath: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create compound indexes for efficient querying
RuleSchema.index({ scope: 1, isActive: 1 });
RuleSchema.index({ scope: 1, languageScope: 1, isActive: 1 });
RuleSchema.index({ scope: 1, projectPath: 1, isActive: 1 });

export const Rule = mongoose.model<IRule>('Rule', RuleSchema);
