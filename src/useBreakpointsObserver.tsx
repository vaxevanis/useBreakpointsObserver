import { useState, useRef, useLayoutEffect } from 'react';
import { BreakSizesType, BreakPointsType } from './types';

// Return the breakPoint size of the targeted html element
export const useBreakpointsObserver = <T extends HTMLElement>(
  htmlRef: React.RefObject<T> | null,
  breakpoints: BreakSizesType,
): [BreakPointsType, number | null] => {
  // Set the first Breakpoint as the initial value of the breaksize
  const initBreakpoint = Object.keys(breakpoints)[0] as BreakPointsType;
  const [breakSize, setBreakSize] = useState<BreakPointsType>(initBreakpoint);
  const [width, SetWidth] = useState<number | null>(null);

  const observer = useRef(
    new ResizeObserver((entries) => {
      //  Get the width of the first element
      const { width: currentWidth } = entries[0].contentRect;

      setBreakSize(getBreakPoint(breakpoints, currentWidth));
      SetWidth(currentWidth);
    }),
  );

  // if the target ref does not exist observe the whole document
  const targetRef = htmlRef?.current ?? document.body;
  // Better we use Layout Effect instead of useEffect
  useLayoutEffect(() => {
    let current = observer.current;
    current.observe(targetRef);
    return () => {
      current.unobserve(targetRef);
    };
  }, [targetRef, observer]);

  return [breakSize, width];
};

// Find the largest breakpoint the element is less than
const getBreakPoint = (
  breakpoints: BreakSizesType,
  width: number,
): BreakPointsType => {
  const breakpointSize: number = Object.entries(breakpoints)
    .map((k, index) => k.filter((x) => width < x))
    .flat()[0] as number;

  if (breakpointSize) {
    // Get the breakpoint for the current breakpoint size
    return getKeyByValue(breakpoints, breakpointSize) as BreakPointsType;
  }

  // Else return the last breakpoint size(largest)
  return Object.keys(breakpoints).pop() as BreakPointsType;
};

function getKeyByValue(object: BreakSizesType, value: number) {
  return Object.keys(object).find(
    (key) => object[key as BreakPointsType] === value,
  );
}

export default useBreakpointsObserver;
