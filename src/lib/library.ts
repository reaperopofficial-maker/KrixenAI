export function saveToLibrary(type: 'images' | 'videos' | 'voice', item: any) {
  try {
    const raw = localStorage.getItem('krixen_library');
    const lib = raw ? JSON.parse(raw) : { images: [], videos: [], voice: [] };
    lib[type] = [item, ...(lib[type] || [])];
    localStorage.setItem('krixen_library', JSON.stringify(lib));
    window.dispatchEvent(new Event('krixen_library_updated'));
  } catch(e) {}
}
