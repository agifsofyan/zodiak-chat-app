export function isEmpty(value: any): boolean {
  return value === null || value === undefined || value === '';
}

export function getFileName(fileUrl: string | null) {
    if (!fileUrl) return null;

    const parts = fileUrl.split('/');

    if (hasFolderInUrl(fileUrl)) {
        return parts.slice(-2).join('/');
    } else {
        return parts.pop();
    }
}

export function hasFolderInUrl(url: string | null): boolean {
    if (!url) return false;

    try {
        const parts = new URL(url).pathname.split('/');
        return parts.length > 3; 
    } catch {
        return false;
    }
}

export function getFileUrl(endpoint: string, port: number|string, bucket: string, name: string, isSsl: boolean) {
    return `${isSsl ? 'https' : 'http'}://${endpoint}:${port}/${bucket}/${name}`;
}