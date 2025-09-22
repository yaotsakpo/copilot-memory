import * as mongoose from 'mongoose';

/**
 * MongoDB schema for Copilot Memory rules
 */
export interface IRuleDocument extends mongoose.Document {
    ruleId: string;
    ruleText: string;
    scope: 'global' | 'project' | 'language';
    languageScope?: string;
    projectPath?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

/**
 * Mongoose schema definition for rules
 */
const ruleSchema = new mongoose.Schema<IRuleDocument>({
    ruleId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    ruleText: {
        type: String,
        required: true,
        maxlength: 500
    },
    scope: {
        type: String,
        required: true,
        enum: ['global', 'project', 'language'],
        index: true
    },
    languageScope: {
        type: String,
        index: true,
        sparse: true // Only index non-null values
    },
    projectPath: {
        type: String,
        index: true,
        sparse: true // Only index non-null values
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    collection: 'copilot_rules'
});

// Compound indexes for efficient queries
ruleSchema.index({ scope: 1, isActive: 1 });
ruleSchema.index({ scope: 1, languageScope: 1, isActive: 1 });
ruleSchema.index({ scope: 1, projectPath: 1, isActive: 1 });
ruleSchema.index({ createdAt: -1 }); // For sorting by creation date

// Pre-save middleware to update the updatedAt field
ruleSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.updatedAt = new Date();
    }
    next();
});

// Pre-update middleware to update the updatedAt field
ruleSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

/**
 * Create and return the Rule model
 * Uses connection-specific model to support multiple databases
 */
export function createRuleModel(connection: mongoose.Connection): mongoose.Model<IRuleDocument> {
    return connection.model<IRuleDocument>('Rule', ruleSchema);
}
