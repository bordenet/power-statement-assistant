import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { showToast, showLoading, hideLoading, confirm, formatDate, escapeHtml, copyToClipboard } from '../js/ui.js';

describe('UI Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <div id="toast-container"></div>
      <div id="loading-overlay" class="hidden">
        <span id="loading-text">Loading...</span>
      </div>
    `;
        jest.clearAllTimers();
    });

    describe('showToast', () => {
        test('should create a toast element in the container', () => {
            showToast('Test message', 'success');
            const container = document.getElementById('toast-container');
            expect(container.children.length).toBe(1);
        });

        test('should display the correct message', () => {
            showToast('Hello World', 'info');
            const container = document.getElementById('toast-container');
            expect(container.innerHTML).toContain('Hello World');
        });

        test('should apply success styling', () => {
            showToast('Success!', 'success');
            const toast = document.querySelector('#toast-container > div');
            expect(toast.className).toContain('bg-green-500');
        });

        test('should apply error styling', () => {
            showToast('Error!', 'error');
            const toast = document.querySelector('#toast-container > div');
            expect(toast.className).toContain('bg-red-500');
        });

        test('should apply warning styling', () => {
            showToast('Warning!', 'warning');
            const toast = document.querySelector('#toast-container > div');
            expect(toast.className).toContain('bg-yellow-500');
        });

        test('should apply info styling by default', () => {
            showToast('Info');
            const toast = document.querySelector('#toast-container > div');
            expect(toast.className).toContain('bg-blue-500');
        });
    });

    describe('showLoading', () => {
        test('should show the loading overlay', () => {
            showLoading();
            const overlay = document.getElementById('loading-overlay');
            expect(overlay.classList.contains('hidden')).toBe(false);
        });

        test('should display custom loading text', () => {
            showLoading('Processing...');
            const text = document.getElementById('loading-text');
            expect(text.textContent).toBe('Processing...');
        });

        test('should use default text when none provided', () => {
            showLoading();
            const text = document.getElementById('loading-text');
            expect(text.textContent).toBe('Loading...');
        });
    });

    describe('hideLoading', () => {
        test('should hide the loading overlay', () => {
            const overlay = document.getElementById('loading-overlay');
            overlay.classList.remove('hidden');

            hideLoading();

            expect(overlay.classList.contains('hidden')).toBe(true);
        });
    });

    describe('confirm', () => {
        test('should resolve true when confirm button is clicked', async () => {
            const confirmPromise = confirm('Are you sure?', 'Delete');

            await new Promise(resolve => setTimeout(resolve, 0));

            const confirmBtn = document.querySelector('#confirm-btn');
            expect(confirmBtn).toBeTruthy();
            confirmBtn.click();

            const result = await confirmPromise;
            expect(result).toBe(true);
        });

        test('should resolve false when cancel button is clicked', async () => {
            const confirmPromise = confirm('Are you sure?');

            await new Promise(resolve => setTimeout(resolve, 0));

            const cancelBtn = document.querySelector('#cancel-btn');
            expect(cancelBtn).toBeTruthy();
            cancelBtn.click();

            const result = await confirmPromise;
            expect(result).toBe(false);
        });
    });

    describe('formatDate', () => {
        test('should return "Just now" for very recent date', () => {
            const now = new Date().toISOString();
            expect(formatDate(now)).toBe('Just now');
        });

        test('should return minutes ago for recent dates', () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            expect(formatDate(fiveMinutesAgo)).toBe('5 minutes ago');
        });

        test('should return hours ago for same-day dates', () => {
            const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
            expect(formatDate(threeHoursAgo)).toBe('3 hours ago');
        });

        test('should return "X days ago" for dates within a week', () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
            expect(formatDate(threeDaysAgo)).toBe('3 days ago');
        });
    });

    describe('escapeHtml', () => {
        test('should escape HTML special characters', () => {
            expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
        });

        test('should return empty string for null/undefined', () => {
            expect(escapeHtml(null)).toBe('');
            expect(escapeHtml(undefined)).toBe('');
        });
    });

    describe('copyToClipboard', () => {
        test('should copy text to clipboard using writeText first', async () => {
            const writeTextMock = jest.fn().mockResolvedValue();
            navigator.clipboard.writeText = writeTextMock;

            await copyToClipboard('test text');

            // The new implementation tries writeText first (Safari MacOS compatible)
            expect(writeTextMock).toHaveBeenCalledTimes(1);
            expect(writeTextMock).toHaveBeenCalledWith('test text');
        });

        test('should throw error if all clipboard methods fail', async () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Mock writeText to fail
            navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Not allowed'));
            // Mock write (ClipboardItem) to also fail
            navigator.clipboard.write = jest.fn().mockRejectedValue(new Error('Not allowed'));
            // Mock execCommand to also fail
            document.execCommand = jest.fn().mockReturnValue(false);

            await expect(copyToClipboard('test text')).rejects.toThrow();

            consoleWarnSpy.mockRestore();
        });

        test('should not show any toast notifications', async () => {
            const writeTextMock = jest.fn().mockResolvedValue();
            navigator.clipboard.writeText = writeTextMock;

            await copyToClipboard('test text');
            const container = document.getElementById('toast-container');
            expect(container.children.length).toBe(0);
        });

        test('should fallback to execCommand when Clipboard API unavailable', async () => {
            // Remove clipboard API
            Object.defineProperty(navigator, 'clipboard', {
                value: undefined,
                writable: true,
            });
            document.execCommand = jest.fn().mockReturnValue(true);

            await copyToClipboard('test text');
            expect(document.execCommand).toHaveBeenCalledWith('copy');
        });
    });
});
