// See how the options work here: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
let options = {
    root: null,
    rootMargin: "200px",
    threshold: 0
}

export const lazyLoad = (image: any, src: string) => {
    let observer: IntersectionObserver|undefined;
    const loaded = () => {
        image.classList.add('loaded')
        image.removeEventListener('load', loaded)
        observer?.unobserve(image)
    }
    observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            image.src = src                                     // replace placeholder src with the image src on observe
            if (image.complete) {                               // check if instantly loaded
                loaded()
            } else {
                image.addEventListener('load', loaded)          // if the image isn't loaded yet, add an event listener
            }
        }
    }, options)
    observer.observe(image)                                     // intersection observer

    return {
        destroy() {
            image.removeEventListener('load', loaded)           // clean up the event listener
            observer?.unobserve(image)                          // clean up the observer
        }
    }
}

export const lazyLoadSet = (image: any, srcset: string|undefined) => {
    if(!srcset) return;

    let observer: IntersectionObserver|undefined;
    const loaded = () => {
        image.classList.add('loaded')
        image.removeEventListener('load', loaded)
        observer?.unobserve(image)
    }
    observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            image.srcset = srcset                                     // replace placeholder src with the image src on observe
            if (image.complete) {                               // check if instantly loaded
                loaded()
            } else {
                image.addEventListener('load', loaded)          // if the image isn't loaded yet, add an event listener
            }
        }
    }, options)
    observer.observe(image)                                     // intersection observer

    return {
        destroy() {
            image.removeEventListener('load', loaded)           // clean up the event listener
            observer?.unobserve(image)                          // clean up the observer
        }
    }
}
