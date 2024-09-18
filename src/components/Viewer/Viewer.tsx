import * as cornerstone from "@cornerstonejs/core";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Events, initializeCornerstone, setupToolGroup, ViewportType } from "./setup";
import createImageIdsAndCacheMetaData from "./cornerstone3D-helpers/createImageIdsAndCacheMetaData";

const renderingEngineId = "myRenderingEngine";
let renderingEngine: cornerstone.Types.IRenderingEngine | undefined;

interface ViewerProps {
  className?: string;
}

const Viewer: React.FC<ViewerProps> = React.memo(({ className = "" }) => {
  const [loading, setLoading] = useState(true);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const run = async () => {
      await initializeCornerstone();

      const element = viewportRef.current;

      if (!element) {
        console.error("Viewport element not found");
        return;
      }

      // Get Cornerstone imageIds and fetch metadata into RAM
      const imageIds = await createImageIdsAndCacheMetaData({
        StudyInstanceUID: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
        SeriesInstanceUID: '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
        wadoRsRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
      });

      // Instantiate a rendering engine
      renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);

      const viewportId = "CT_STACK";
      const viewportInput: cornerstone.Types.PublicViewportInput = {
        viewportId,
        type: ViewportType.STACK,
        element,
        defaultOptions: {
          background: [0, 0, 0],
        },
      };

      renderingEngine.enableElement(viewportInput);

      // Get the stack viewport that was created
      const viewport = renderingEngine.getViewport(viewportId) as cornerstone.Types.IStackViewport;

      // Set the stack on the viewport
      await viewport.setStack(imageIds);

      // Setup tool group
      setupToolGroup(element, viewportId, renderingEngineId);

      // Render the image
      viewport.render();

      setLoading(false);
    };

    run();

    return () => {
      if (renderingEngine) {
        renderingEngine.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (renderingEngine) {
        renderingEngine.resize(true, false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleImageLoaded = () => {
      setLoading(false);
    };

    cornerstone.eventTarget.addEventListener(Events.IMAGE_LOADED, handleImageLoaded);

    return () => {
      cornerstone.eventTarget.removeEventListener(Events.IMAGE_LOADED, handleImageLoaded);
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={viewportRef} className="w-full h-full">
        {loading && (
          <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin" />
          </p>
        )}
      </div>
    </div>
  );
});

export default Viewer;