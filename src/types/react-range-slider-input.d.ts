declare module 'react-range-slider-input' {
  import * as React from 'react';

  export interface RangeSliderProps {
    min?: number;
    max?: number;
    step?: number;
    value?: [number, number];
    defaultValue?: [number, number];
    onInput?: (value: [number, number]) => void;
    onChange?: (value: [number, number]) => void;
    disabled?: boolean;
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    thumbsDisabled?: [boolean, boolean];
    rangeSlideDisabled?: boolean;
    onThumbDragStart?: () => void;
    onThumbDragEnd?: () => void;
    onRangeDragStart?: () => void;
    onRangeDragEnd?: () => void;
  }

  const RangeSlider: React.FC<RangeSliderProps>;
  export default RangeSlider;
}