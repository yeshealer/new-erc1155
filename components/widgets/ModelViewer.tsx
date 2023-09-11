import { useRouter } from 'next/router';
import '@google/model-viewer/lib/model-viewer';

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
    const router = useRouter();
    return (
        <>
            {router.isFallback ? (
                <div>Loading</div>
            ) : (
                <model-viewer style={{ width: '100%', height: '100%', background: '#e0f2fe', borderRadius: '12px', minHeight: '200px' }} src={prevURL} camera-controls="true" touch-action="pan-y" ar-status="not-presenting" />
            )}
        </>
    )
}
