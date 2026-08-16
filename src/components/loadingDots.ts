import { refreshIcon } from "../icons/refresh";

export function loadingDots(fetching : boolean) : HTMLDivElement{
    const pulseContainer = document.createElement("div");
    pulseContainer.className = "pulse-container";
    if (fetching){

        for (let i = 0; i < 3; i++) {
            const pulseBubble = document.createElement("div")
            const classname = 'pulse-bubble';
            pulseBubble.classList.add(classname);
            pulseBubble.classList.add(classname + `-${i+1}`);
            pulseContainer.appendChild(pulseBubble);
        }

    } else {
        pulseContainer.innerHTML = refreshIcon;
    }

    return pulseContainer
}