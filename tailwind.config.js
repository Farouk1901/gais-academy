import tailwindAnimate from 'tailwindcss-animate';
import containerQuery from '@tailwindcss/container-queries';
import intersect from 'tailwindcss-intersect';

export default {
    darkMode: ['class'],
    content: [
        './index.html',
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
        './node_modules/streamdown/dist/**/*.js'
    ],
    safelist: ['border', 'border-border'],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                'arabic': ['Noto Kufi Arabic', 'Noto Sans Arabic', 'sans-serif'],
                'kufi': ['Noto Kufi Arabic', 'sans-serif'],
                'montserrat': ['Inter', 'sans-serif'],
                'inter': ['Inter', 'sans-serif'],
                'cairo': ['Noto Kufi Arabic', 'Cairo', 'sans-serif'],
                'noto-arabic': ['Noto Kufi Arabic', 'Noto Sans Arabic', 'sans-serif'],
                'heading': ['Noto Kufi Arabic', 'Cairo', 'sans-serif'],
            },
            colors: {
                border: 'hsl(var(--border) / <alpha-value>)',
                borderColor: {
                    border: 'hsl(var(--border))'
                },
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card) / <alpha-value>)',
                    foreground: 'hsl(var(--card-foreground))'
                },
                education: {
                    blue: 'hsl(221 83% 53%)',
                    green: 'hsl(142 71% 45%)'
                },
                success: 'hsl(var(--success) / <alpha-value>)',
                warning: 'hsl(var(--warning) / <alpha-value>)',
                info: 'hsl(var(--info) / <alpha-value>)',
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    background: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary) / <alpha-value>)',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent) / <alpha-value>)',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                },
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            backgroundImage: {
                'gradient-primary': 'var(--gradient-primary)',
                'gradient-card': 'var(--gradient-card)',
                'gradient-background': 'var(--gradient-background)'
            },
            boxShadow: {
                card: 'var(--shadow-card)',
                hover: 'var(--shadow-hover)'
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                },
                'fade-in': {
                    from: {
                        opacity: '0',
                        transform: 'translateY(10px)'
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                'slide-in': {
                    from: {
                        opacity: '0',
                        transform: 'translateX(-20px)'
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateX(0)'
                    }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'slide-in': 'slide-in 0.5s ease-out'
            }
        }
    },
    plugins: [
        tailwindAnimate,
        containerQuery,
        intersect,
        function ({addUtilities}) {
            addUtilities(
                {
                    '.border-t-solid': {'border-top-style': 'solid'},
                    '.border-r-solid': {'border-right-style': 'solid'},
                    '.border-b-solid': {'border-bottom-style': 'solid'},
                    '.border-l-solid': {'border-left-style': 'solid'},
                    '.border-t-dashed': {'border-top-style': 'dashed'},
                    '.border-r-dashed': {'border-right-style': 'dashed'},
                    '.border-b-dashed': {'border-bottom-style': 'dashed'},
                    '.border-l-dashed': {'border-left-style': 'dashed'},
                    '.border-t-dotted': {'border-top-style': 'dotted'},
                    '.border-r-dotted': {'border-right-style': 'dotted'},
                    '.border-b-dotted': {'border-bottom-style': 'dotted'},
                    '.border-l-dotted': {'border-left-style': 'dotted'},
                },
                ['responsive']
            );
        },
    ],
};
