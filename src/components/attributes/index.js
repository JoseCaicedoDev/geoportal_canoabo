// Barrel exports for Attribute Panel microcomponents
// Following Clean Code Architecture and PWA microfrontend patterns

// Core microcomponents
export { default as AttributeHeader } from './AttributeHeader.vue'
export { default as AttributeControls } from './AttributeControls.vue'
export { default as AttributeTable } from './AttributeTable.vue'
export { default as AttributePagination } from './AttributePagination.vue'
export { default as AttributeFooter } from './AttributeFooter.vue'

/**
 * Microcomponent Architecture Overview:
 *
 * AttributeHeader.vue - Panel header with title, navigation and export actions
 * AttributeControls.vue - Search and display controls with accessibility
 * AttributeTable.vue - Responsive data table with sorting and selection
 * AttributePagination.vue - Navigation controls with ARIA compliance
 * AttributeFooter.vue - Statistics summary and bulk actions
 *
 * All components follow:
 * - Single Responsibility Principle
 * - Semantic HTML5 structure
 * - ARIA accessibility guidelines
 * - Reactive props/events interface
 * - Tailwind CSS with design tokens
 */
