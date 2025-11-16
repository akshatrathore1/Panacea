declare module 'qrcode' {
    type QRCodeDataUrlOptions = {
        width?: number
        margin?: number
        scale?: number
        color?: {
            dark?: string
            light?: string
        }
        [key: string]: unknown
    }

    export function toDataURL(text: string, options?: QRCodeDataUrlOptions): Promise<string>

    const qrcode: {
        toDataURL: typeof toDataURL
    }

    export default qrcode
}
