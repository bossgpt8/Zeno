# BossAI Chatbot - Design Guidelines

## Design Approach

**Selected System**: Linear Design Language + Modern Chat Interface Patterns (ChatGPT, Claude)

**Rationale**: This is a utility-focused AI productivity tool requiring clarity, efficiency, and a polished dark interface. Linear's approach to dark themes, information hierarchy, and minimal distractions aligns perfectly with an AI assistant that users will interact with extensively.

**Core Principles**:
- Clarity over decoration
- Content-first hierarchy
- Purposeful spacing
- Responsive precision
- Functional minimalism

---

## Typography

**Font Stack**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Hierarchy**:
- **App Title/Branding**: 18px, weight-700, letter-spacing tight
- **Primary Headers**: 16px, weight-600, used for section headers
- **Body/Chat Messages**: 15px, weight-400, line-height-1.7 (optimal readability)
- **UI Labels**: 13px, weight-500, for form labels, timestamps
- **Secondary Text**: 13px, weight-400, for metadata, hints
- **Code Blocks**: 13px, monospace (`'SF Mono', 'Fira Code', monospace`)
- **Captions/Badges**: 11px, weight-600, uppercase tracking-wide

**Special Treatment**:
- Model badges and status indicators: 11px, semi-bold, uppercase
- Welcome screen headline: 32px, weight-700, gradient treatment
- Error messages: 14px, weight-500

---

## Layout System

**Spacing Primitives**: Use Tailwind units **2, 3, 4, 6, 8, 12, 16, 20, 24**

**Application**:
- Button padding: px-4 py-3 (standard), px-6 py-3 (primary actions)
- Section padding: p-4 (mobile), p-6 (desktop)
- Card spacing: p-5 to p-6
- Message gaps: mb-8 between messages
- Input fields: p-3
- Icon buttons: w-10 h-10 or w-11 h-11
- Avatar sizes: 32px (small), 36px (standard), 40px (large)

**Grid Structure**:
- Sidebar: Fixed 288px (72 in Tailwind units) on desktop
- Main content: max-w-4xl (1024px) centered with px-6 padding
- Conversation list items: Full width with 12px padding
- Feature cards: 2-column grid on tablet+, single column on mobile

**Key Spacing Rules**:
- Consistent 16px (p-4) gaps between UI sections
- 32px (mb-8) vertical rhythm for messages
- 12px (gap-3) for button groups
- 20px (p-5) for modal/card interiors

---

## Component Library

### Navigation & Sidebar
- **Sidebar Container**: Fixed width, full height, subtle border separator
- **Logo Area**: 40px icon + text, 20px bottom padding, border separator
- **New Chat Button**: Full width, prominent treatment, icon + text
- **Conversation List**: Scrollable area with custom slim scrollbar (6px width)
- **Conversation Items**: 12px padding, rounded-lg, hover state, active state with left border accent
- **Model Selector**: Full width dropdown, 12px padding, rounded-xl, custom styling
- **Auth Section**: Fixed to bottom, border separator above

### Chat Interface
- **Messages Container**: Scrollable with max-w-4xl centering, px-6 padding
- **Message Bubble**: No traditional bubbles - use left-aligned text blocks with avatar
- **Message Header**: Avatar (36px rounded-lg) + role label (14px semi-bold) + action buttons (appear on hover)
- **Message Content**: 50px left padding (aligned with avatar), generous line-height
- **Code Blocks**: Dedicated container, rounded-xl, copy button top-right (appears on hover)
- **Image Previews**: Max-width constraints, rounded corners, shadow treatment

### Input Area
- **Container**: Fixed to bottom, border-top separator, backdrop blur
- **Text Input**: Multi-line with auto-expand, 14px text, p-4 padding, rounded-xl
- **Attachment Previews**: Horizontal scroll, 90px thumbnails, remove button overlay
- **Action Buttons**: Icon-only, 40px square, rounded-lg, positioned right
- **Send Button**: Prominent, rounded-xl, icon + optional text on desktop

### Modals & Overlays
- **Modal Container**: Centered, max-w-md, rounded-2xl, backdrop blur
- **Modal Header**: 24px padding, semi-bold title, close button top-right
- **Modal Body**: 24px padding, form fields with 16px gaps
- **Form Inputs**: Full width, 12px padding, rounded-lg, border treatment
- **Submit Buttons**: Full width, 12px padding, rounded-lg, loading states

### Buttons & Controls
- **Primary Button**: Solid fill, 12px padding horizontal, rounded-xl, medium weight text
- **Secondary Button**: Border treatment, transparent fill, same dimensions
- **Icon Button**: 40px square, rounded-lg, icon centered
- **Toggle Button**: Border + icon, active state changes fill
- **Danger Button**: Red treatment for destructive actions

### Cards & Containers
- **Feature Cards**: Border, rounded-2xl, p-5 padding, hover lift effect
- **Welcome Suggestions**: 2-column grid, icon (48px) + title + description
- **Status Indicators**: Dot (8px) + label, inline-flex alignment
- **Badges**: Rounded-full, px-3 py-1, uppercase 11px text

### Feedback Elements
- **Notifications**: Fixed bottom-center, slide-up animation, 14px padding horizontal, rounded-xl, 3-second auto-dismiss
- **Loading Indicators**: 3-dot typing animation for messages, spinner for button states
- **Error States**: Inline below inputs, 13px text, icon + message
- **Empty States**: Centered, icon + headline + description, suggestion actions

---

## Interaction Patterns

### Animations
**Philosophy**: Minimal, purposeful motion

- **Message Entry**: 0.4s ease-out slide-up + fade
- **Sidebar Toggle**: 0.3s ease transform
- **Hover States**: 0.2s transition for background/border changes
- **Button Loading**: Smooth spinner rotation, no pulsing
- **Notification**: 0.3s cubic-bezier slide + fade
- **Modal**: 0.2s backdrop fade, 0.3s content scale-fade

**Avoid**: Excessive micro-interactions, parallax, complex keyframe animations

### Responsive Behavior
- **Desktop (1024px+)**: Sidebar always visible, 2-column layouts enabled
- **Tablet (768px-1023px)**: Collapsible sidebar, single column with generous spacing
- **Mobile (<768px)**: Hidden sidebar (hamburger menu), full-width components, larger tap targets (44px minimum)

### Accessibility
- **Focus States**: 2px outline offset, high contrast indicator
- **Keyboard Navigation**: Tab order follows visual hierarchy, Escape closes modals
- **Screen Readers**: Proper ARIA labels for icon-only buttons, role attributes for chat messages
- **Color Independence**: Never rely on color alone (use icons + text)

---

## Visual Hierarchy

**Emphasis Levels** (without specifying colors):
1. **Primary Actions**: Highest contrast fill, prominent placement
2. **Active States**: Fill treatment, border accent
3. **Content Text**: Standard contrast for readability
4. **Secondary UI**: Reduced opacity/weight, smaller size
5. **Disabled States**: Lowest contrast, cursor-not-allowed

**Depth Layers**:
- Background: Base layer
- Surface: Cards, inputs, elevated 1 level
- Elevated: Modals, dropdowns, elevated 2 levels with shadow
- Overlay: Notifications, tooltips, highest z-index

---

## Special Considerations

### Code Display
- Dedicated monospace font
- Syntax highlighting via highlight.js with dark theme
- Copy button: absolute positioned top-right, hover reveal
- Horizontal scroll for overflow, no word wrap

### Image Handling
- Vision model attachments: 250px max preview size
- Generated images: Up to 512px, centered, shadow treatment
- Lightbox on click for full-size viewing
- Progressive loading states

### Voice Features
- Microphone button: Visual recording state (pulsing animation)
- Voice toggle: Persistent state indicator in header
- Waveform visualization during recording (optional enhancement)

### Smart Commands
- Instant execution without confirmation for safe commands
- Confirmation modal for destructive actions
- Success/error feedback via notifications

---

## Mobile Optimization

- **Touch Targets**: Minimum 44px height for all interactive elements
- **Gesture Support**: Swipe to open/close sidebar
- **Input Focus**: Smooth scroll to visible area, no zoom on input focus
- **Image Previews**: Touch-optimized gallery with swipe
- **Action Sheets**: Bottom sheets on mobile vs modals on desktop

---

This design creates a professional, efficient AI chatbot interface that prioritizes clarity, functionality, and user productivity while maintaining a modern, polished aesthetic suitable for extended use.