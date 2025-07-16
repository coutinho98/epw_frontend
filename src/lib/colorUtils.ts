// src/lib/colorUtils.ts

// Mapeamento de cores
export const COLOR_MAP: { [key: string]: string } = {
    'preto': '#000000',
    'black': '#000000',
    'branco': '#ffffff',
    'white': '#ffffff',
    'azul': '#0066cc',
    'blue': '#0066cc',
    'vermelho': '#cc0000',
    'red': '#cc0000',
    'verde': '#009900',
    'green': '#009900',
    'amarelo': '#ffcc00',
    'yellow': '#ffcc00',
    'rosa': '#ff69b4',
    'pink': '#ff69b4',
    'roxo': '#8a2be2',
    'purple': '#8a2be2',
    'laranja': '#ff8c00',
    'orange': '#ff8c00',
    'marrom': '#8b4513',
    'brown': '#8b4513',
    'cinza': '#808080',
    'gray': '#808080',
    'bege': '#f5f5dc',
    'beige': '#f5f5dc',
};

// Nova e mais robusta função getColorValue
export const getColorValue = (color: string): string => {
    const normalizedColor = color.toLowerCase().trim();

    // Verifica se a cor está no nosso mapa
    if (COLOR_MAP[normalizedColor]) {
        return COLOR_MAP[normalizedColor];
    }

    // Se a cor parece ser um código hex ou RGB, use-a diretamente
    if (normalizedColor.startsWith('#') || normalizedColor.startsWith('rgb')) {
        return normalizedColor;
    }

    // Tenta validar como uma cor nomeada CSS
    const s = new Option().style;
    s.color = normalizedColor;
    if (s.color !== '') {
        return normalizedColor;
    }

    // Valor padrão se a cor for inválida
    return '#CCCCCC';
};


export function isValidColor(strColor: string): boolean {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
}

export const isLightColor = (color: string): boolean => {
    const hex = color.startsWith('#') ? color.slice(1) : color;
    if (hex.length === 3) {
        const hex3 = hex.split('').map(c => c + c).join('');
        const r = parseInt(hex3.substring(0, 2), 16);
        const g = parseInt(hex3.substring(2, 4), 16);
        const b = parseInt(hex3.substring(4, 6), 16);
        const luminosity = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return luminosity > 186; // Um valor de corte para cores claras
    } else if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminosity = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return luminosity > 186;
    }
    return false;
};