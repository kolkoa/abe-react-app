import { StyleOption } from '../config/styles';

interface StyleSelectorProps {
    styles: StyleOption[];
    selectedStyle: string;
    onStyleChange: (style: string) => void;
}

export function StyleSelector({ styles, selectedStyle, onStyleChange }: StyleSelectorProps) {
    return (
        <select
            value={selectedStyle}
            onChange={(e) => onStyleChange(e.target.value)}
            style={{ padding: '8px', marginLeft: '8px' }}
        >
            {styles.map((style) => (
                <option key={style.value} value={style.value}>
                    {style.label}
                </option>
            ))}
        </select>
    );
}