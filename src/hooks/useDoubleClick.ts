import { useCallback, useRef } from 'react';

// ----------------------------------------------------------------------

type Props = {
	timeout?: number;
	click?: (_e: React.SyntheticEvent) => void;
	doubleClick: (_e: React.SyntheticEvent) => void;
};

export default function useDoubleClick({ click, doubleClick, timeout = 250 }: Props) {
	const clickTimeout = useRef<any>();

	const clearClickTimeout = () => {
		if (clickTimeout) {
			clearTimeout(clickTimeout.current);
			clickTimeout.current = null;
		}
	};

	return useCallback(
		(event: React.MouseEvent<HTMLElement>) => {
			clearClickTimeout();
			if (click && event.detail === 1) {
				clickTimeout.current = setTimeout(() => {
					click(event);
				}, timeout);
			}
			if (event.detail % 2 === 0) {
				doubleClick(event);
			}
		},
		[click, doubleClick, timeout]
	);
}
