import { TEXT_PRIMARY } from "../../../constants/textColorsConstants";
import React from 'react'; // Import React

// Define the props type
type InputProps = {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Make onKeyDown optional
    disabled?: boolean; // ✅ add this
    type ?: string;
}

export default function Input({
    placeholder,
    value,
    onChange,
    onKeyDown // Destructure onKeyDown
}: InputProps) {
    return (
        <input
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown} // <-- Pass it to the input element
            style={{
                width: "100%",
                height: "34px",
                padding: "8px 32px 8px 12px", // Add extra right padding for clear button
                border: `1px solid #E0E0E0`,
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "#FFFFFF",
                color: "#1C1C1C",
            }}
            onFocus={(e) => {
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
    )
}