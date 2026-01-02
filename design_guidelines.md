# Zeno Chatbot - Design Guidelines

## Design Approach

**Selected Reference**: ChatGPT Interface + Linear Refinement

**Rationale**: ChatGPT sets the standard for elegant AI chat interfaces with generous whitespace, sophisticated typography, and premium feel. We'll adopt its spacious layout, refined messaging patterns, and polished interaction model while maintaining Linear's precision.

**Core Principles**:
- Generous breathing room over density
- Typography-driven hierarchy
- Elegant simplicity
- Premium, polished details
- Conversation-first design

---

## Typography

**Font Stack**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Refined Hierarchy**:
- **App Branding**: 20px, weight-700, letter-spacing tight (-0.02em)
- **Welcome Headline**: 40px, weight-700, line-height-1.1, tracking tight
- **Section Headers**: 18px, weight-600, tracking tight
- **Message Content**: 16px, weight-400, line-height-1.75 (exceptional readability)
- **User Messages**: 15px, weight-450, line-height-1.7
- **UI Labels**: 14px, weight-500
- **Secondary Text**: 14px, weight-400, reduced opacity
- **Code Blocks**: 14px, `'SF Mono', 'Fira Code', Consolas, monospace`
- **Timestamps/Metadata**: 12px, weight-400, tracking-wide
- **Badges**: 12px, weight-600, uppercase, tracking-wide

**Special Treatment**:
- Message author names: 15px, weight-600, subtle emphasis
- Error messages: 14px, weight-500, icon pairing
- Button text: 15px, weight-500, letter-spacing subtle

---

## Layout System

**Spacing Primitives**: Tailwind units **3, 4, 6, 8, 12, 16, 20, 24, 32**

**Premium Spacing Application**:
- Message vertical gaps: mb-12 (48px) - generous conversation flow
- Section padding: p-6 (mobile), p-8 (desktop)
- Card interiors: p-6 to p-8
- Input containers: p-4
- Button padding: px-6 py-3.5 (premium touch targets)
- Icon buttons: w-12 h-12 (larger, easier to click)
- Modal padding: p-8 to p-10

**Layout Structure**:
- **Sidebar**: 280px fixed width, full height
- **Main Chat**: max-w-3xl (768px) centered - narrower for better readability
- **Message Content**: max-w-2xl for optimal reading line length
- **Input Area**: max-w-3xl matching chat width
- **Welcome Cards**: Single column, full width within container

**Breathing Room Rules**:
- 48px vertical rhythm between messages (mb-12)
- 24px padding around input area (p-6)
- 32px top/bottom margins for sections (my-8)
- 16px gaps for button groups (gap-4)

---

## Component Library

### Navigation & Sidebar
- **Container**: 280px fixed, minimal border, subtle backdrop
- **Header**: Logo + text, pb-6, clean separator
- **New Chat Button**: Full width, px-4 py-3.5, prominent rounded-xl, icon-left alignment
- **Conversation List**: Slim 4px scrollbar, smooth scroll behavior
- **List Items**: px-4 py-3, rounded-lg, hover elevation, active border-left accent (3px)
- **Bottom Section**: Settings + profile, pt-4 border-top

### Chat Interface
- **Messages Container**: max-w-3xl centered, px-8 py-6, spacious layout
- **Message Block**: No bubbles, left-aligned with avatar, 48px bottom margin
- **Avatar Treatment**: 40px rounded-xl (larger, premium feel), positioned top-left
- **Message Header**: Avatar + name (15px semi-bold) + timestamp, mb-3 spacing
- **Message Content**: pl-14 (56px) for text alignment past avatar, generous line-height 1.75
- **Code Blocks**: rounded-2xl, p-5, horizontal scrollbar, copy button absolute top-right with backdrop blur
- **Action Buttons**: Inline below message, 10px icon buttons, appear on hover, gap-2

### Input Area
- **Container**: Fixed bottom, border-top, backdrop-blur-lg, py-6 px-8
- **Input Wrapper**: rounded-2xl, border, shadow-sm, overflow-hidden
- **Textarea**: Multi-line, py-4 px-5, 16px text, max-height-[200px], auto-resize
- **Attachment Bar**: Horizontal scroll, 100px thumbnails, gap-3, rounded-xl previews
- **Bottom Actions**: Flex justify-between, pt-3 px-5
- **Send Button**: h-11 px-6, rounded-xl, icon + text on desktop, icon-only mobile

### Modals & Overlays
- **Backdrop**: Blur overlay with smooth fade
- **Modal**: max-w-lg, rounded-3xl, shadow-2xl, backdrop-blur
- **Header**: px-8 pt-8 pb-6, 20px semi-bold title, close button (icon-only, 10px)
- **Body**: px-8 pb-8, form fields with gap-5
- **Form Inputs**: Full width, px-4 py-3.5, rounded-xl, border subtle
- **Footer Actions**: px-8 pb-8, gap-3, primary + secondary buttons

### Buttons & Controls
- **Primary**: Solid fill, px-6 py-3.5, rounded-xl, 15px medium text, subtle shadow
- **Secondary**: Border subtle, transparent, same padding, 15px medium text
- **Icon Button**: 48px square, rounded-xl, 20px icon, hover lift
- **Danger**: Red treatment, same structure as primary
- **Toggle**: Border with active fill state, icon-left + text

### Cards & Features
- **Welcome Cards**: Full width, border subtle, rounded-2xl, p-6, hover shadow-md elevation
- **Suggestion Items**: Icon (56px rounded-2xl) + title (18px semi-bold) + description (15px), gap-4
- **Empty State**: Centered, 64px icon, 24px headline, 16px description, py-20

### Feedback Elements
- **Toast Notifications**: Bottom-center, px-6 py-4, rounded-2xl, shadow-xl, 3.5s dismiss, slide-up animation
- **Loading States**: Elegant 3-dot animation (10px dots), spinner 20px for buttons
- **Error Messages**: Below inputs, 14px text, icon-left, gap-2, pt-2

---

## Interaction Patterns

**Animations** (minimal, refined):
- Message entry: 0.5s ease-out fade-up
- Hover states: 0.15s all transitions
- Modal: 0.2s backdrop fade, 0.25s scale(0.95) to scale(1)
- Button loading: 0.3s smooth rotation
- Sidebar toggle: 0.35s ease transform
- Toast: 0.3s cubic-bezier slide-up

**Responsive**:
- Desktop (1024px+): Sidebar visible, max-w-3xl chat
- Tablet (768-1023px): Collapsible sidebar, px-6 padding
- Mobile (<768px): Hidden sidebar (menu button), px-4 padding, full-width input

**Accessibility**:
- Focus rings: 2px offset, high contrast
- Tab navigation: Logical flow, Escape closes modals
- ARIA labels: All icon buttons, message roles
- Touch targets: 48px minimum on mobile

---

## Visual Hierarchy

**Contrast Levels** (content-first):
1. **Primary Actions/Content**: Highest contrast text and fills
2. **Active Elements**: Elevated state, border accents
3. **Standard Content**: Optimal reading contrast
4. **Secondary UI**: Subtle reduced opacity (0.6-0.7)
5. **Disabled**: Lowest contrast (0.4 opacity)

**Elevation Strategy**:
- Base: Background layer
- Surface: Cards, inputs (+1 shadow-sm)
- Raised: Modals, dropdowns (+2 shadow-lg)
- Floating: Toasts, tooltips (+3 shadow-xl)

---

## Special Features

### Code & Syntax
- Syntax highlighting: VS Code dark theme palette
- Copy button: Hover-reveal, backdrop-blur, absolute top-4 right-4
- Inline code: px-2 py-1, rounded-md, monospace 14px

### Image Handling
- Vision attachments: 200px max preview, rounded-xl, shadow-sm
- Generated images: Up to 512px, centered, shadow-lg, click-to-expand
- Gallery: Horizontal scroll, gap-3, snap-scroll

### Mobile Optimization
- Touch targets: 48px minimum height
- Swipe gestures: Sidebar open/close
- Action sheets: Bottom-drawer on mobile
- Input focus: No zoom, smooth scroll to view

---

**Result**: A premium, ChatGPT-inspired interface with generous spacing (48px message gaps), elegant 16px message text with 1.75 line-height, refined 40px avatars, spacious 768px max-width conversation area, and sophisticated typography hierarchy that prioritizes readability and polish over density.