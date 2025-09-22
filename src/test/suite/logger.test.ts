import * as assert from 'assert';
import { Logger } from '../../utils/logger';

suite('Logger Utility Tests', () => {
    suite('Static Methods', () => {
        test('should have info method', () => {
            assert.ok(typeof Logger.info === 'function');

            // Test that info doesn't throw
            assert.doesNotThrow(() => {
                Logger.info('Test info message');
            });
        });

        test('should have warn method', () => {
            assert.ok(typeof Logger.warn === 'function');

            // Test that warn doesn't throw
            assert.doesNotThrow(() => {
                Logger.warn('Test warning message');
            });
        });

        test('should have error method', () => {
            assert.ok(typeof Logger.error === 'function');

            // Test that error doesn't throw
            assert.doesNotThrow(() => {
                Logger.error('Test error message');
            });
        });

        test('should handle Error objects in error logging', () => {
            const error = new Error('Test error object');

            // Test that error with Error object doesn't throw
            assert.doesNotThrow(() => {
                Logger.error('Error occurred', error);
            });
        });

        test('should handle additional arguments', () => {
            const additionalData = { key: 'value' };

            // Test that logging with additional data doesn't throw
            assert.doesNotThrow(() => {
                Logger.info('Test with data', additionalData);
            });
        });

        test('should have show method', () => {
            assert.ok(typeof Logger.show === 'function');

            // Test that show doesn't throw
            assert.doesNotThrow(() => {
                Logger.show();
            });
        });

        test('should handle multiple log calls', () => {
            // Test that multiple calls don't throw
            assert.doesNotThrow(() => {
                Logger.info('First message');
                Logger.info('Second message');
                Logger.warn('Warning message');
            });
        });
    });

    suite('Message Handling', () => {
        test('should handle empty messages', () => {
            assert.doesNotThrow(() => {
                Logger.info('');
                Logger.warn('');
                Logger.error('');
            });
        });

        test('should handle null/undefined values', () => {
            assert.doesNotThrow(() => {
                Logger.info('Test with null', null);
                Logger.info('Test with undefined', undefined);
            });
        });

        test('should handle complex objects', () => {
            const complexObject = {
                nested: { data: [1, 2, 3] },
                func: () => 'test'
            };

            assert.doesNotThrow(() => {
                Logger.info('Complex object test', complexObject);
            });
        });
    });
});
