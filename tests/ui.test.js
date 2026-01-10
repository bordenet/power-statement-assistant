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
        test('should call clipboard API with text', async () => {
            await copyToClipboard('test text');
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
        });

        test('should throw error when clipboard API fails', async () => {
            navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Clipboard access denied'));
            // Also mock execCommand to fail (fallback)
            document.execCommand = jest.fn().mockReturnValue(false);
            // The function should throw an error when both methods fail
            await expect(copyToClipboard('test text')).rejects.toThrow();
        });

        test('should not show any toast notifications', async () => {
            await copyToClipboard('test text');
            const container = document.getElementById('toast-container');
            expect(container.children.length).toBe(0);
        });
    });
});

