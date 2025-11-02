import React from 'react'

interface TextDividerProps {
    text: string;
    fontSize?: string;
    lineColor?: string; // Optional prop, defaults to black
    lineThickness?: number; // Optional prop in px, defaults to 1
    textColor?: string;    // Optional prop, defaults to the default text color
}

const TextDivider = ({text, fontSize, lineColor, lineThickness=1, textColor}:TextDividerProps) => {
    const dividerStyles: React.CSSProperties = {
        fontSize: fontSize || 'inherit',
        display: 'flex',
        alignItems: 'center',
        margin: '20px 0',
        color: textColor || 'inherit',
        // Optional: Ensure the overall vertical alignment is correct
        lineHeight: '1.2', 
    };

    const lineStyles: React.CSSProperties = {
        flex: '1', 
        content: '', 
        marginInline: '5px',
        minWidth: '50px',
        backgroundColor: lineColor, 
        height: `${lineThickness}px`,
        // Ensures the line sits perfectly in the middle
        alignSelf: 'center',
    };

    return (
        <div style={dividerStyles}>
            {/* Left Line */}
            <div style={lineStyles} /> 
            
            {/* Text */}
            <span style={{ 
                // Removes potential line-height issues with text
                whiteSpace: 'nowrap',
                verticalAlign: 'middle',
                lineHeight: '1.0',
                padding: '0 2px',
                boxSizing: 'content-box'
            }}>
                {text}
            </span>
            
            {/* Right Line */}
            <div style={lineStyles} />
        </div>
    );
}

export default TextDivider;