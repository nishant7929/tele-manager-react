import { RefObject, useEffect, useRef, useLayoutEffect } from 'react';

// ----------------------------------------------------------------------

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Window Event based useEventListener interface
function useEventListener<K extends keyof WindowEventMap>(
	__eventName: K,
	__handler: (__event: WindowEventMap[K]) => void,
	__element?: undefined,
	__options?: boolean | AddEventListenerOptions
): void;

// Element Event based useEventListener interface
function useEventListener<
	K extends keyof HTMLElementEventMap,
	T extends HTMLElement = HTMLDivElement
>(
	__eventName: K,
	__handler: (__event: HTMLElementEventMap[K]) => void,
	__element: RefObject<T>,
	__options?: boolean | AddEventListenerOptions
): void;

// Document Event based useEventListener interface
function useEventListener<K extends keyof DocumentEventMap>(
	__eventName: K,
	__handler: (__event: DocumentEventMap[K]) => void,
	__element: RefObject<Document>,
	__options?: boolean | AddEventListenerOptions
): void;

function useEventListener<
	KW extends keyof WindowEventMap,
	KH extends keyof HTMLElementEventMap,
	T extends HTMLElement | void = void
>(
	eventName: KW | KH,
	handler: (__event: WindowEventMap[KW] | HTMLElementEventMap[KH] | Event) => void,
	element?: RefObject<T>,
	options?: boolean | AddEventListenerOptions
) {
	// Create a ref that stores handler
	const savedHandler = useRef(handler);

	useIsomorphicLayoutEffect(() => {
		savedHandler.current = handler;
	}, [handler]);

	useEffect(() => {
		// Define the listening target
		const targetElement: T | Window = element?.current || window;
		if (!(targetElement && targetElement.addEventListener)) {
			return;
		}

		// Create event listener that calls handler function stored in ref
		const eventListener: typeof handler = (event) => savedHandler.current(event);

		targetElement.addEventListener(eventName, eventListener, options);

		// Remove event listener on cleanup
		// eslint-disable-next-line consistent-return
		return () => {
			targetElement.removeEventListener(eventName, eventListener);
		};
	}, [eventName, element, options]);
}

export default useEventListener;
