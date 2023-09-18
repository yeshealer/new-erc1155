import '@google/model-viewer/lib/model-viewer';
import { useEffect, useState } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': MyElementAttributes;
        }
        interface MyElementAttributes {
            src: string;
            style: { width: string; height: string; background: string; borderRadius: string, minHeight: string }
        }
    }
}

interface ModelViewerProps {
    prevURL: string
}

export default function ModelViewer({
    prevURL
}: ModelViewerProps) {
    const [hasNavigator, setHasNavigator] = useState(false);

    useEffect(() => {
        if (typeof navigator !== 'undefined') {
            setHasNavigator(true)
            return;
        }
        setHasNavigator(false)
    }, [])

    return (
        <model-viewer
            style={{ width: '99%', height: '100%', background: '#e0f2fe', borderRadius: '12px', minHeight: '200px' }}
            src={prevURL}
            camera-controls={hasNavigator ? 'true' : undefined}
            touch-action="pan-y"
            ar-status="not-presenting"
        />
    )
}
