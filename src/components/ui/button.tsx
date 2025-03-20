import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    asChild = false, 
    ...props 
  }, ref) => {
    // Inline styles based on variant and size
    const getStyles = () => {
      const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap' as const,
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? '0.5' : '1',
      };

      // Variant styles
      const variantStyles = {
        default: {
          backgroundColor: '#3b82f6', // primary blue
          color: 'white',
        },
        destructive: {
          backgroundColor: '#ef4444', // red
          color: 'white',
        },
        outline: {
          backgroundColor: 'transparent',
          color: 'currentColor',
          border: '1px solid #e2e8f0',
        },
        secondary: {
          backgroundColor: '#f1f5f9', // light gray
          color: '#0f172a',
        },
        ghost: {
          backgroundColor: 'transparent',
          color: 'currentColor',
        },
        link: {
          backgroundColor: 'transparent',
          color: '#3b82f6',
          textDecoration: 'underline',
        }
      };

      // Size styles
      const sizeStyles = {
        default: {
          height: '2.5rem',
          padding: '0 1rem',
        },
        sm: {
          height: '2rem',
          padding: '0 0.75rem',
          fontSize: '0.75rem',
        },
        lg: {
          height: '3rem',
          padding: '0 1.5rem',
          fontSize: '1rem',
        },
        icon: {
          height: '2.5rem',
          width: '2.5rem',
          padding: '0',
        }
      };

      return {
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size],
      };
    };

    return (
      <button
        ref={ref}
        style={getStyles()}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
