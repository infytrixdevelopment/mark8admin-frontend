import { TEXT_PRIMARY } from "../../../constants/textColorsConstants";

export default function Textarea({
    placeholder,
    value,
    onChange }: { placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
    return (
        <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={4}
            style={{
                width: "100%",
                minHeight: "80px",
                padding: "8px 12px",
                border: `1px solid #E0E0E0`,
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "#FFFFFF",
                color: "#1C1C1C",
                resize: "vertical",
            }}
            onFocus={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = TEXT_PRIMARY.PURPLE;
                target.style.boxShadow = `0 0 0 2px ${TEXT_PRIMARY.PURPLE}20`;
            }}
            onBlur={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = "#E0E0E0";
                target.style.boxShadow = "none";
            }}
            onMouseEnter={(e) => {
                const target = e.target as HTMLTextAreaElement;
                if (document.activeElement !== target) {
                    target.style.borderColor = TEXT_PRIMARY.PURPLE;
                }
            }}
            onMouseLeave={(e) => {
                const target = e.target as HTMLTextAreaElement;
                if (document.activeElement !== target) {
                    target.style.borderColor = "#E0E0E0";
                }
            }}
        />
    )
}

