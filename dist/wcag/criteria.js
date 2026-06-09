"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WCAG_22_CRITERIA = void 0;
exports.getCriterion = getCriterion;
exports.getCriteriaForTarget = getCriteriaForTarget;
/**
 * WCAG 2.2 success criteria through level AA.
 * Sourced from W3C WCAG 2.2 — https://www.w3.org/WAI/standards-guidelines/wcag/
 */
exports.WCAG_22_CRITERIA = [
    { id: '1.1.1', title: 'Non-text Content', slug: 'non-text-content', level: 'A', principle: 'Perceivable', guideline: '1.1 Text Alternatives' },
    { id: '1.2.1', title: 'Audio-only and Video-only (Prerecorded)', slug: 'audio-only-and-video-only-prerecorded', level: 'A', principle: 'Perceivable', guideline: '1.2 Time-based Media' },
    { id: '1.2.2', title: 'Captions (Prerecorded)', slug: 'captions-prerecorded', level: 'A', principle: 'Perceivable', guideline: '1.2 Time-based Media' },
    { id: '1.2.3', title: 'Audio Description or Media Alternative (Prerecorded)', slug: 'audio-description-or-media-alternative-prerecorded', level: 'A', principle: 'Perceivable', guideline: '1.2 Time-based Media' },
    { id: '1.3.1', title: 'Info and Relationships', slug: 'info-and-relationships', level: 'A', principle: 'Perceivable', guideline: '1.3 Adaptable' },
    { id: '1.3.2', title: 'Meaningful Sequence', slug: 'meaningful-sequence', level: 'A', principle: 'Perceivable', guideline: '1.3 Adaptable' },
    { id: '1.3.3', title: 'Sensory Characteristics', slug: 'sensory-characteristics', level: 'A', principle: 'Perceivable', guideline: '1.3 Adaptable' },
    { id: '1.4.1', title: 'Use of Color', slug: 'use-of-color', level: 'A', principle: 'Perceivable', guideline: '1.4 Distinguishable' },
    { id: '1.4.2', title: 'Audio Control', slug: 'audio-control', level: 'A', principle: 'Perceivable', guideline: '1.4 Distinguishable' },
    { id: '1.4.3', title: 'Contrast (Minimum)', slug: 'contrast-minimum', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable' },
    { id: '1.4.4', title: 'Resize Text', slug: 'resize-text', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable' },
    { id: '1.4.5', title: 'Images of Text', slug: 'images-of-text', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable' },
    { id: '1.4.10', title: 'Reflow', slug: 'reflow', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', introducedIn: '2.1' },
    { id: '1.4.11', title: 'Non-text Contrast', slug: 'non-text-contrast', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', introducedIn: '2.1' },
    { id: '1.4.12', title: 'Text Spacing', slug: 'text-spacing', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', introducedIn: '2.1' },
    { id: '1.4.13', title: 'Content on Hover or Focus', slug: 'content-on-hover-or-focus', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', introducedIn: '2.1' },
    { id: '2.1.1', title: 'Keyboard', slug: 'keyboard', level: 'A', principle: 'Operable', guideline: '2.1 Keyboard Accessible' },
    { id: '2.1.2', title: 'No Keyboard Trap', slug: 'no-keyboard-trap', level: 'A', principle: 'Operable', guideline: '2.1 Keyboard Accessible' },
    { id: '2.1.4', title: 'Character Key Shortcuts', slug: 'character-key-shortcuts', level: 'A', principle: 'Operable', guideline: '2.1 Keyboard Accessible', introducedIn: '2.2' },
    { id: '2.2.1', title: 'Timing Adjustable', slug: 'timing-adjustable', level: 'A', principle: 'Operable', guideline: '2.2 Enough Time' },
    { id: '2.2.2', title: 'Pause, Stop, Hide', slug: 'pause-stop-hide', level: 'A', principle: 'Operable', guideline: '2.2 Enough Time' },
    { id: '2.3.1', title: 'Three Flashes or Below Threshold', slug: 'three-flashes-or-below-threshold', level: 'A', principle: 'Operable', guideline: '2.3 Seizures and Physical Reactions' },
    { id: '2.4.1', title: 'Bypass Blocks', slug: 'bypass-blocks', level: 'A', principle: 'Operable', guideline: '2.4 Navigable' },
    { id: '2.4.2', title: 'Page Titled', slug: 'page-titled', level: 'A', principle: 'Operable', guideline: '2.4 Navigable' },
    { id: '2.4.3', title: 'Focus Order', slug: 'focus-order', level: 'A', principle: 'Operable', guideline: '2.4 Navigable' },
    { id: '2.4.4', title: 'Link Purpose (In Context)', slug: 'link-purpose-in-context', level: 'A', principle: 'Operable', guideline: '2.4 Navigable' },
    { id: '2.4.5', title: 'Multiple Ways', slug: 'multiple-ways', level: 'AA', principle: 'Operable', guideline: '2.4 Navigable' },
    { id: '2.4.6', title: 'Headings and Labels', slug: 'headings-and-labels', level: 'AA', principle: 'Operable', guideline: '2.4 Navigable' },
    { id: '2.4.7', title: 'Focus Visible', slug: 'focus-visible', level: 'AA', principle: 'Operable', guideline: '2.4 Navigable' },
    { id: '2.4.11', title: 'Focus Not Obscured (Minimum)', slug: 'focus-not-obscured-minimum', level: 'AA', principle: 'Operable', guideline: '2.4 Navigable', introducedIn: '2.2' },
    { id: '2.5.1', title: 'Pointer Gestures', slug: 'pointer-gestures', level: 'A', principle: 'Operable', guideline: '2.5 Input Modalities', introducedIn: '2.1' },
    { id: '2.5.2', title: 'Pointer Cancellation', slug: 'pointer-cancellation', level: 'A', principle: 'Operable', guideline: '2.5 Input Modalities', introducedIn: '2.1' },
    { id: '2.5.3', title: 'Label in Name', slug: 'label-in-name', level: 'A', principle: 'Operable', guideline: '2.5 Input Modalities', introducedIn: '2.1' },
    { id: '2.5.4', title: 'Motion Actuation', slug: 'motion-actuation', level: 'A', principle: 'Operable', guideline: '2.5 Input Modalities', introducedIn: '2.1' },
    { id: '2.5.7', title: 'Dragging Movements', slug: 'dragging-movements', level: 'AA', principle: 'Operable', guideline: '2.5 Input Modalities', introducedIn: '2.2' },
    { id: '2.5.8', title: 'Target Size (Minimum)', slug: 'target-size-minimum', level: 'AA', principle: 'Operable', guideline: '2.5 Input Modalities', introducedIn: '2.2' },
    { id: '3.1.1', title: 'Language of Page', slug: 'language-of-page', level: 'A', principle: 'Understandable', guideline: '3.1 Readable' },
    { id: '3.1.2', title: 'Language of Parts', slug: 'language-of-parts', level: 'AA', principle: 'Understandable', guideline: '3.1 Readable' },
    { id: '3.2.1', title: 'On Focus', slug: 'on-focus', level: 'A', principle: 'Understandable', guideline: '3.2 Predictable' },
    { id: '3.2.2', title: 'On Input', slug: 'on-input', level: 'A', principle: 'Understandable', guideline: '3.2 Predictable' },
    { id: '3.2.3', title: 'Consistent Navigation', slug: 'consistent-navigation', level: 'AA', principle: 'Understandable', guideline: '3.2 Predictable' },
    { id: '3.2.4', title: 'Consistent Identification', slug: 'consistent-identification', level: 'AA', principle: 'Understandable', guideline: '3.2 Predictable' },
    { id: '3.2.6', title: 'Consistent Help', slug: 'consistent-help', level: 'AA', principle: 'Understandable', guideline: '3.2 Predictable', introducedIn: '2.2' },
    { id: '3.3.1', title: 'Error Identification', slug: 'error-identification', level: 'A', principle: 'Understandable', guideline: '3.3 Input Assistance' },
    { id: '3.3.2', title: 'Labels or Instructions', slug: 'labels-or-instructions', level: 'A', principle: 'Understandable', guideline: '3.3 Input Assistance' },
    { id: '3.3.3', title: 'Error Suggestion', slug: 'error-suggestion', level: 'AA', principle: 'Understandable', guideline: '3.3 Input Assistance' },
    { id: '3.3.4', title: 'Error Prevention (Legal, Financial, Data)', slug: 'error-prevention-legal-financial-data', level: 'AA', principle: 'Understandable', guideline: '3.3 Input Assistance' },
    { id: '3.3.7', title: 'Redundant Entry', slug: 'redundant-entry', level: 'A', principle: 'Understandable', guideline: '3.3 Input Assistance', introducedIn: '2.2' },
    { id: '3.3.8', title: 'Accessible Authentication (Minimum)', slug: 'accessible-authentication-minimum', level: 'AA', principle: 'Understandable', guideline: '3.3 Input Assistance', introducedIn: '2.2' },
    { id: '4.1.2', title: 'Name, Role, Value', slug: 'name-role-value', level: 'A', principle: 'Robust', guideline: '4.1 Compatible' },
    { id: '4.1.3', title: 'Status Messages', slug: 'status-messages', level: 'AA', principle: 'Robust', guideline: '4.1 Compatible', introducedIn: '2.1' },
];
const LEVEL_ORDER = { A: 1, AA: 2, AAA: 3 };
const criteriaById = new Map(exports.WCAG_22_CRITERIA.map((c) => [c.id, c]));
function getCriterion(id) {
    return criteriaById.get(id);
}
function getCriteriaForTarget(version, level) {
    const maxLevel = LEVEL_ORDER[level];
    return exports.WCAG_22_CRITERIA.filter((c) => {
        if (LEVEL_ORDER[c.level] > maxLevel) {
            return false;
        }
        if (c.obsoleteIn && version >= c.obsoleteIn) {
            return false;
        }
        return true;
    });
}
//# sourceMappingURL=criteria.js.map