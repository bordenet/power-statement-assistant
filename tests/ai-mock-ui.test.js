/**
 * Unit Tests for AI Mock UI Module
 *
 * Tests UI controls for toggling AI mock mode on/off.
 */

import { initMockModeUI, updateMockModeUI, handleMockModeToggle } from '../js/ai-mock-ui.js';
import { setMockMode, isMockMode } from '../js/ai-mock.js';

describe('AI Mock UI Module', () => {
    let originalLocation;
    let alertMock;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';

        // Mock location for development environment testing
        originalLocation = window.location;
        delete window.location;
        window.location = { hostname: 'localhost' };

        // Mock alert
        alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        // Reset mock mode to disabled
        setMockMode(false);
    });

    afterEach(() => {
        window.location = originalLocation;
        alertMock.mockRestore();
        setMockMode(false);
    });

    describe('initMockModeUI', () => {
        test('creates toggle in development environment', () => {
            window.location.hostname = 'localhost';
            initMockModeUI();
            expect(document.getElementById('mock-mode-toggle')).toBeTruthy();
        });

        test('creates toggle on 127.0.0.1', () => {
            window.location.hostname = '127.0.0.1';
            initMockModeUI();
            expect(document.getElementById('mock-mode-toggle')).toBeTruthy();
        });

        test('does not create toggle in production environment', () => {
            window.location.hostname = 'github.io';
            initMockModeUI();
            expect(document.getElementById('mock-mode-toggle')).toBeNull();
        });

        test('does not create duplicate toggle', () => {
            initMockModeUI();
            initMockModeUI();
            const toggles = document.querySelectorAll('#mock-mode-toggle');
            expect(toggles.length).toBe(1);
        });

        test('creates checkbox', () => {
            initMockModeUI();
            const checkbox = document.getElementById('mock-mode-checkbox');
            expect(checkbox).toBeTruthy();
            expect(checkbox.type).toBe('checkbox');
        });

        test('checkbox reflects current mock mode state', () => {
            setMockMode(true);
            initMockModeUI();
            const checkbox = document.getElementById('mock-mode-checkbox');
            expect(checkbox.checked).toBe(true);
        });
    });

    describe('updateMockModeUI', () => {
        beforeEach(() => {
            initMockModeUI();
        });

        test('updates checkbox state when enabled', () => {
            setMockMode(true);
            updateMockModeUI();
            const checkbox = document.getElementById('mock-mode-checkbox');
            expect(checkbox.checked).toBe(true);
        });

        test('creates page indicator when mock mode is enabled', () => {
            setMockMode(true);
            updateMockModeUI();
            expect(document.getElementById('mock-mode-indicator')).toBeTruthy();
        });

        test('removes page indicator when mock mode is disabled', () => {
            // First enable mock mode
            setMockMode(true);
            updateMockModeUI();
            expect(document.getElementById('mock-mode-indicator')).toBeTruthy();

            // Then disable mock mode
            setMockMode(false);
            updateMockModeUI();
            expect(document.getElementById('mock-mode-indicator')).toBeNull();
        });

        test('handles missing checkbox gracefully', () => {
            document.body.innerHTML = '';
            expect(() => updateMockModeUI()).not.toThrow();
        });
    });

    describe('handleMockModeToggle', () => {
        test('enables mock mode when checkbox is checked', () => {
            initMockModeUI();
            const event = { target: { checked: true } };
            handleMockModeToggle(event);
            expect(isMockMode()).toBe(true);
        });

        test('disables mock mode when checkbox is unchecked', () => {
            setMockMode(true);
            initMockModeUI();
            const event = { target: { checked: false } };
            handleMockModeToggle(event);
            expect(isMockMode()).toBe(false);
        });
    });

    describe('Info button interaction', () => {
        test('shows alert when info button is clicked', () => {
            initMockModeUI();
            const infoButton = document.querySelector('#mock-mode-toggle button');
            expect(infoButton).toBeTruthy();
            infoButton.click();
            expect(alertMock).toHaveBeenCalled();
        });

        test('info button has correct title', () => {
            initMockModeUI();
            const infoButton = document.querySelector('#mock-mode-toggle button');
            expect(infoButton.title).toContain('information');
        });
    });

    describe('Toggle container structure', () => {
        test('has correct structure with label, checkbox, and info button', () => {
            initMockModeUI();
            const container = document.getElementById('mock-mode-toggle');
            expect(container).toBeTruthy();
            expect(container.querySelector('label')).toBeTruthy();
            expect(container.querySelector('input[type="checkbox"]')).toBeTruthy();
            expect(container.querySelector('button')).toBeTruthy();
            expect(container.querySelector('span')).toBeTruthy();
        });
    });
});
