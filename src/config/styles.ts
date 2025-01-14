export interface StyleOption {
    value: string;
    label: string;
    description?: string;
}

export const RECRAFT_STYLES: StyleOption[] = [
    { value: 'realistic_image', label: 'Realistic Image' },
    { value: 'digital_illustration', label: 'Digital Illustration' },
    { value: 'vector_illustration', label: 'Vector Illustration' }
];