export function waitForElement(selector : string) : Promise<Element | null> {
    return new Promise((resolve) => {
        const existing : Element | null = document.querySelector(selector);

        if (existing) {
            return resolve(existing);
        }

        const observer : MutationObserver = new MutationObserver(() => {
            const ele : Element | null = document.querySelector(selector);


            if (ele) {
                observer.disconnect();
                resolve(ele);
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        })
    })
}

export function waitForElements (selector : string) : Promise<NodeListOf<Element>> {
    return new Promise ((resolve) => {
        const scriptsExisting : NodeListOf<Element> = document.querySelectorAll(selector);

        if (scriptsExisting.length > 0) {
            return resolve(scriptsExisting);
        }

        const observer = new MutationObserver(() => {
            const scripts : NodeListOf<Element> = document.querySelectorAll(selector);
            if (scripts.length > 0) {
                observer.disconnect();
                resolve(scripts);
            }
        })

        observer.observe(document.documentElement, {
            childList : true,
            subtree : true
        }) 
    })
}
