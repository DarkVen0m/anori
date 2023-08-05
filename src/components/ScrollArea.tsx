import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import './ScrollArea.scss';
import { ComponentProps, ReactNode, WheelEvent, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { m } from 'framer-motion';
import { forwardRef } from 'react';

type ScrollAreaProps = {
    children?: ReactNode,
    className?: string,
    contentClassName?: string,
    color?: 'light' | 'dark' | 'translucent',
    type?: RadixScrollArea.ScrollAreaContextValue['type'],
    direction?: 'vertical' | 'horizontal' | 'both',
    mirrorVerticalScrollToHorizontal?: boolean,
    size?: 'normal' | 'thin',
    onVerticalOverflowStatusChange?: (overflows: boolean) => void,
    onHorizontalOverflowStatusChange?: (overflows: boolean) => void,
} & ComponentProps<typeof m.div>;

const checkVerticalOverflow = (el: Element) => el.clientHeight < el.scrollHeight;
const checkHorizontalOverflow = (el: Element) => el.clientWidth < el.scrollWidth;

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(({ 
    children, className, contentClassName, type = "auto", color = 'light', 
    direction = 'vertical', onHorizontalOverflowStatusChange, onVerticalOverflowStatusChange, 
    size = 'normal', mirrorVerticalScrollToHorizontal = false, ...props 
}, ref) => {
    const mirrorScroll = (e: WheelEvent<HTMLDivElement>) => {
        e.stopPropagation();
        // e.preventDefault();
        if (e.deltaY) {
            e.currentTarget.scrollLeft += e.deltaY;
            // e.currentTarget.scrollLeft += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        } 
    };

    const onContentResize = () => {
        if (!viewportRef.current) return;
        const newHorizontalOverflow = checkHorizontalOverflow(viewportRef.current);
        const newVerticalOverflow = checkVerticalOverflow(viewportRef.current);

        if (newHorizontalOverflow !== horizontalOverflowRef.current && onHorizontalOverflowStatusChange) {
            onHorizontalOverflowStatusChange(newHorizontalOverflow);
        }

        if (newVerticalOverflow !== verticalOverflowRef.current && onVerticalOverflowStatusChange) {
            onVerticalOverflowStatusChange(newVerticalOverflow);
        }

        horizontalOverflowRef.current = newHorizontalOverflow;
        verticalOverflowRef.current = newVerticalOverflow;
    };

    const viewportRef = useRef<HTMLDivElement>(null);
    const horizontalOverflowRef = useRef(false);
    const verticalOverflowRef = useRef(false);

    return (<RadixScrollArea.Root className={clsx("ScrollAreaRoot", className, `color-${color}`, `direction-${direction}`, `size-${size}`)} asChild type={type} ref={ref}>
        <m.div {...props}>
            <ResizeObserverComponent onResize={onContentResize} />
            <RadixScrollArea.Viewport 
            className={clsx("ScrollAreaViewport", contentClassName)} 
            ref={viewportRef} 
            onWheel={(direction === 'horizontal' && mirrorVerticalScrollToHorizontal) ? mirrorScroll : undefined}
            >
                {children}
            </RadixScrollArea.Viewport>
            {['vertical', 'both'].includes(direction) && <RadixScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="vertical">
                <RadixScrollArea.Thumb className="ScrollAreaThumb" />
            </RadixScrollArea.Scrollbar>}
            {['horizontal', 'both'].includes(direction) && <RadixScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="horizontal">
                <RadixScrollArea.Thumb className="ScrollAreaThumb" />
            </RadixScrollArea.Scrollbar>}
            <RadixScrollArea.Corner className="ScrollAreaCorner" />
        </m.div>
    </RadixScrollArea.Root>)
});

const ResizeObserverComponent = ({ onResize }: { onResize: () => void }) => {
    const ctx = RadixScrollArea.useScrollAreaContext();

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            onResize();
        });

        if (ctx.content) {
            observer.observe(ctx.content);
        }

        return () => observer.disconnect();
    }, [ctx.content]);

    return (<></>);
};

export const MotionScrollArea = m(ScrollArea);