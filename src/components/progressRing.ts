export function progressRing(color:string = '#3b82f6') {
    const svgNS = 'http://www.w3.org/2000/svg';
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeWidth = 15;

    // SVG
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');

    // Track
    const track = document.createElementNS(svgNS, 'circle');
    track.setAttribute('cx', '50');
    track.setAttribute('cy', '50');
    track.setAttribute('r', String(radius));
    track.setAttribute('fill', 'none');
    track.setAttribute('stroke', 'hsla(220, 13%, 91%, 0.2)');
    track.setAttribute('stroke-width', String(strokeWidth));

    // Ring
    const ring = document.createElementNS(svgNS, 'circle');
    ring.setAttribute('cx', '50');
    ring.setAttribute('cy', '50');
    ring.setAttribute('r', String(radius));
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', color);
    ring.setAttribute('stroke-width', String(strokeWidth));
    ring.setAttribute('stroke-dasharray', String(circumference));
    ring.setAttribute('stroke-dashoffset', String(circumference));
    ring.setAttribute('stroke-linecap', 'round');
    ring.setAttribute('transform', 'rotate(-90 50 50)');
    ring.style.transition = 'stroke-dashoffset 0.3s ease';

    svg.appendChild(track);
    svg.appendChild(ring);

    function setProgress(percent: number) {
        const offset = circumference - (percent / 100) * circumference;
        ring.setAttribute('stroke-dashoffset', String(offset));
    }

    return { svg, setProgress };
}