import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import useUnmountedRef from './useUnmountedRef';

function useSafeState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

function useSafeState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

function useSafeState<S>(initialState?: S | (() => S)) {
  const unmountedRef = useUnmountedRef();
  const [state, setState] = useState(initialState);
  const setCurrentState = useCallback((currentState: any) => {
    /** If component is unmounted, stop update */
    if (unmountedRef.current) return;
    setState(currentState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [state, setCurrentState] as const;
}

export default useSafeState;