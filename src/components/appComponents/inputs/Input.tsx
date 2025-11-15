import { TEXT_PRIMARY } from "../../../constants/textColorsConstants";
import React from 'react'; 

// Define the props type
type InputProps = {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; 
    disabled?: boolean; 
    type ?: string;
    className?: string; 
    endDecorator?: React.ReactNode; 
    sx?: React.CSSProperties & { [key: string]: any }; 
    name?: string; // <-- 1. ADD THE 'name' PROP HERE
};

export default function Input({
    placeholder,
    value,
    onChange,
    onKeyDown,
    disabled,
    type,
    className,      
    endDecorator,   
    sx,
    name            // <-- 2. Destructure the 'name' prop
}: InputProps) {
    const baseStyle: React.CSSProperties = {
        width: "100%",
        height: "34px",
        padding: "8px 12px",
        paddingRight: endDecorator ? "40px" : "12px", 
        border: `1px solid #E0E0E0`,
        borderRadius: "6px",
        fontSize: "14px",
        fontFamily: "inherit",
        outline: "none",
        transition: "all 0.2s ease-in-out",
        backgroundColor: disabled ? "#F5F5F5" : "#FFFFFF",
        color: "#1C1C1C",
        cursor: disabled ? "not-allowed" : "text",
        boxSizing: 'border-box', 
    };
    
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                disabled={disabled}
                type={type}
                className={className} 
                style={{ ...baseStyle, ...sx }} 
                name={name} // <-- 3. PASS THE 'name' PROP TO THE INPUT
                onFocus={(e) => {
                    if (disabled) return; 
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = TEXT_PRIMARY.PURPLE;
                    target.style.boxShadow = `0 0 0 2px ${TEXT_PRIMARY.PURPLE}20`;
                }}
                onBlur={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = "#E0E0E0";
                    target.style.boxShadow = "none";
                }}
                onMouseEnter={(e) => {
                    if (disabled) return;
                    const target = e.target as HTMLInputElement;
                    if (document.activeElement !== target) {
                        target.style.borderColor = TEXT_PRIMARY.PURPLE;
                    }
                }}
                onMouseLeave={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (document.activeElement !== target) {
                        target.style.borderColor = "#E0E0E0";
                    }
                }}
            />
            {endDecorator && (
                <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {endDecorator}
                </div>
            )}
        </div>
    )
}