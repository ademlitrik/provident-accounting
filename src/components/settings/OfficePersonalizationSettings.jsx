import React from 'react'

/**
 * Microsoft Office-Style Personalization Settings Component
 * Recreates the exact native desktop Office Backstage / Account Personalization UI:
 * - Office Background dropdown (Circles and Stripes, Circuit, Clouds, etc.)
 * - Office Theme dropdown (Colorful, Dark Gray, Black, White, Use system setting)
 * - Exact Segoe UI typography, 370px × 23px dimensions, #F5F5F5 background, #B8B8B8 border
 */
export default function OfficePersonalizationSettings({
  background = 'No Background',
  theme = 'Colorful',
  onChangeBackground,
  onChangeTheme,
}) {
  const backgrounds = [
    'No Background',
    'Circles and Stripes',
    'Circuit',
    'Clouds',
    'Doodle Circles',
    'Stars',
  ]

  const themes = [
    'Colorful',
    'Dark Gray',
    'Black',
    'White',
    'Use system setting',
  ]

  return (
    <div
      style={{
        backgroundColor: '#F5F5F5',
        color: '#3F3F3F',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '24px 28px',
        border: '1px solid #E0E0E0',
        borderRadius: '2px',
        maxWidth: '540px',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Setting 1: Office Background */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="office-background-select"
            style={{
              fontSize: '14px',
              color: '#3F3F3F',
              fontWeight: 400,
              lineHeight: '1.2',
            }}
          >
            Office Background:
          </label>
          <div style={{ position: 'relative', width: '100%', maxWidth: '370px' }}>
            <select
              id="office-background-select"
              value={background}
              onChange={(e) => onChangeBackground?.(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '370px',
                height: '23px',
                fontSize: '12px',
                color: '#262626',
                backgroundColor: '#FFFFFF',
                border: '1px solid #B8B8B8',
                borderRadius: '4px',
                padding: '1px 24px 1px 6px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                cursor: 'default',
                outline: 'none',
                boxSizing: 'border-box',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0078D4'
                e.target.style.boxShadow = '0 0 0 1px #0078D4'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#B8B8B8'
                e.target.style.boxShadow = 'none'
              }}
            >
              {backgrounds.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
            {/* Native-style subtle dropdown arrow */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: '7px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                <path d="M0.5 0.75L4 4.25L7.5 0.75" stroke="#4A4A4A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Setting 2: Office Theme */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="office-theme-select"
            style={{
              fontSize: '14px',
              color: '#3F3F3F',
              fontWeight: 400,
              lineHeight: '1.2',
            }}
          >
            Office Theme:
          </label>
          <div style={{ position: 'relative', width: '100%', maxWidth: '370px' }}>
            <select
              id="office-theme-select"
              value={theme}
              onChange={(e) => onChangeTheme?.(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '370px',
                height: '23px',
                fontSize: '12px',
                color: '#262626',
                backgroundColor: '#FFFFFF',
                border: '1px solid #B8B8B8',
                borderRadius: '4px',
                padding: '1px 24px 1px 6px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                cursor: 'default',
                outline: 'none',
                boxSizing: 'border-box',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0078D4'
                e.target.style.boxShadow = '0 0 0 1px #0078D4'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#B8B8B8'
                e.target.style.boxShadow = 'none'
              }}
            >
              {themes.map((th) => (
                <option key={th} value={th}>
                  {th}
                </option>
              ))}
            </select>
            {/* Native-style subtle dropdown arrow */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: '7px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                <path d="M0.5 0.75L4 4.25L7.5 0.75" stroke="#4A4A4A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
