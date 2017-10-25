import { ReactElement } from "react";

type FiberRootContainer = { _reactRootContainer: { current: FiberComponent } };

type FiberComponent<P = {}> = {
    memoizedState: {
        element: ReactElement<P>;
    };
    stateNode: Node & { container?: FiberRootContainer };
    child: FiberComponent;
    sibling: FiberComponent;
    type: null | string | { displayName: string; name: string };
    return: FiberComponent;
};

export function react16Selector(rootElements: Node[], selector: string) {
    let visitedRootEls: FiberComponent[] = [];

    function checkRootNodeVisited(component: FiberComponent) {
        return visitedRootEls.indexOf(component) !== -1;
    }

    const roots = rootElements.map((x: any) => {
        if (!x._reactRootContainer) {
            throw new Error("Element has to be React 16 root element");
        }
        return x as FiberRootContainer;
    });
    const rootEls = roots.map(x => x._reactRootContainer.current);

    /*eslint-enable no-unused-vars*/
    function createAnnotationForEmptyComponent(component: any) {
        const comment = document.createComment(
            "testcafe-react-selectors: the requested component didn't render any DOM elements"
        );

        (comment as any).__$$reactInstance = component;

        return comment;
    }

    function getName(component: FiberComponent) {
        if (!component.type && !component.memoizedState) return null;

        const currentElementType = component.type ? component.type : component.memoizedState.element.type;

        // NOTE: tag
        if (typeof currentElementType === "string") return currentElementType;
        if (currentElementType.displayName || currentElementType.name) {
            return currentElementType.displayName || currentElementType.name;
        }

        const matches = currentElementType.toString().match(/^function\s*([^\s(]+)/);

        if (matches) return matches[1];

        return null;
    }

    function getContainer(component: FiberComponent) {
        let node = component;

        while (!(node.stateNode instanceof Node)) {
            if (node.child) node = node.child;
            else break;
        }

        if (!(node.stateNode instanceof Node)) return null;

        return node.stateNode;
    }

    function getRenderedChildren(component: FiberComponent) {
        const isRootComponent = rootEls.indexOf(component) > -1;

        // Nested root element
        if (isRootComponent) {
            if (checkRootNodeVisited(component)) return [];

            visitedRootEls.push(component);
        }

        // Portal component
        if (!component.child) {
            const portalRoot =
                component.stateNode &&
                component.stateNode.container &&
                component.stateNode.container._reactRootContainer;

            if (portalRoot) component = portalRoot.current;
        }

        if (!component.child) return [];

        let currentChild = component.child;

        if (typeof component.type !== "string") {
            currentChild = component.child;
        }

        const children = [currentChild];

        while (currentChild.sibling) {
            children.push(currentChild.sibling);

            currentChild = currentChild.sibling;
        }

        return children;
    }

    function parseSelectorElements(compositeSelector: string) {
        return compositeSelector
            .split(" ")
            .filter(el => !!el)
            .map(el => el.trim());
    }

    function reactSelect(compositeSelector: string) {
        const foundComponents: Node[] = [];

        function findDOMNode(rootComponent: FiberComponent) {
            if (typeof compositeSelector !== "string") {
                throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);
            }

            let selectorIndex = 0;
            const selectorElms = parseSelectorElements(compositeSelector);

            function walk(reactComponent: FiberComponent, cb: (comp: FiberComponent) => boolean) {
                if (!reactComponent) return;

                const componentWasFound = cb(reactComponent);
                const currSelectorIndex = selectorIndex;

                const isNotFirstSelectorPart = selectorIndex > 0 && selectorIndex < selectorElms.length;

                if (isNotFirstSelectorPart && !componentWasFound) {
                    const isTag = selectorElms[selectorIndex].toLowerCase() === selectorElms[selectorIndex];

                    // NOTE: we're looking for only between the children of component
                    if (isTag && getName(reactComponent.return) !== selectorElms[selectorIndex - 1]) return;
                }

                const renderedChildren = getRenderedChildren(reactComponent);

                renderedChildren.forEach(child => {
                    walk(child, cb);

                    selectorIndex = currSelectorIndex;
                });
            }

            return walk(rootComponent, reactComponent => {
                const componentName = getName(reactComponent);
                // console.log(componentName);

                if (!componentName) return false;

                const domNode = getContainer(reactComponent);

                if (selectorElms[selectorIndex] !== componentName) {
                    return false;
                }

                if (selectorIndex === selectorElms.length - 1) {
                    foundComponents.push(domNode || createAnnotationForEmptyComponent(reactComponent));
                }

                selectorIndex++;

                return true;
            });
        }

        rootEls.forEach(findDOMNode);

        return foundComponents;
    }

    return reactSelect(selector);
}
