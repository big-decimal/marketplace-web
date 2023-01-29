import { Placement } from "@popperjs/core";
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";

interface PopoverProps {
  placement?: Placement;
  offset?: [number, number];
  showOnHover?: boolean;
  hideOnPopper?: boolean;
  hideOnPopperClick?: boolean;
  hideOnLeave?: boolean;
  sameWidth?: boolean;
  children: (
    show: () => void,
    hide: () => void
  ) => [ReactElement<ReferenceProps>, ReactElement<PopoverProps>];
}

interface ReferenceProps {
  children: ReactNode;
}

interface PopperProps {
  children?: ReactNode;
}

function Reference(props: ReferenceProps) {
  return <>{props.children}</>;
}

function Popper(props: PopperProps) {
  return <>{props.children}</>;
}

function Popover(props: PopoverProps) {
  const {
    placement,
    offset,
    showOnHover,
    hideOnPopper,
    hideOnLeave,
    hideOnPopperClick,
    sameWidth,
    children
  } = props;

  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(
    referenceElement.current,
    popperElement.current,
    {
      modifiers: [
        { name: "arrow", options: { element: arrowElement } },
        {
          name: "offset",
          options: {
            offset: offset ?? [0, 4]
          }
        }
      ],
      placement: placement ?? "bottom-start",
      strategy: "absolute"
    }
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDocumentClick = (e: MouseEvent) => {
    if (
      e.target instanceof Node &&
      (referenceElement?.current?.contains(e.target) ?? false)
    ) {
      return;
    }

    if (
      e.target instanceof Node &&
      !hideOnPopperClick &&
      (popperElement?.current?.contains(e.target) ?? false)
    ) {
      return;
    }

    setOpen(false);
  };

  const showPopper = () => {
    !open && setOpen(true);
  };

  const hidePopper = () => {
    setOpen(false);
  };

  return (
    <>
      <div
        ref={referenceElement}
        onMouseEnter={(evt) => {
          showOnHover && showPopper();
        }}
        onMouseLeave={(evt) => {
          hideOnLeave && open && hidePopper();
        }}
      >
        {/* {renderReferenceElement(() => setOpen(!open))} */}
        {children(showPopper, hidePopper).find((e) => e.type === Reference)}
      </div>

      <div
        ref={popperElement}
        style={{
          ...styles.popper,
          zIndex: 9999,
          width: sameWidth ? referenceElement.current?.clientWidth : undefined
        }}
        {...attributes.popper}
        onMouseLeave={(evt) => {
          hideOnPopper && open && hidePopper();
        }}
      >
        {/* {open && renderPopperElement(() => setOpen(false))} */}
        {open &&
          children(showPopper, hidePopper).find((e) => e.type === Popper)}
        <div ref={setArrowElement} style={styles.arrow} />
      </div>
    </>
  );
}

Popover.Reference = Reference;
Popover.Popper = Popper;

export default Popover;
