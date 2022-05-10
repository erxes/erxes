import * as React from "react";
import { ILocationOption } from "../types";

interface IMarkerProps extends google.maps.MarkerOptions {
  onChange: (location: ILocationOption) => void;
  content?: any;
  color?: string;
}

const Marker: React.FC<IMarkerProps> = ({
  color,
  content,
  onChange,
  ...options
}) => {
  const [marker, setMarker] = React.useState<google.maps.Marker | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (!marker) {
      const newMarker = new google.maps.Marker({
        icon: getIconAttributes(color || "#1338BE"),
      });

      if (content) {
        const infoWindow = new google.maps.InfoWindow({
          content,
        });

        newMarker.addListener("mouseover", () => {
          infoWindow.open({
            anchor: newMarker,
            shouldFocus: false,
          });
        });

        newMarker.addListener("mouseout", () => {
          infoWindow.close();
        });
      }

      if (options.draggable) {
        google.maps.event.addListener(newMarker, "dragend", () => {
          const location = newMarker.getPosition();
          if (location) {
            onChange({
              lat: location.lat(),
              lng: location.lng(),
              description: content,
            });
          }
        });
      } else {
        newMarker.addListener("click", () => {
          const location = newMarker.getPosition();
          if (location) {
            onChange({
              lat: location.lat(),
              lng: location.lng(),
              description: content,
            });
          }
        });
      }

      setMarker(newMarker);
    }

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  React.useEffect(() => {
    if (marker) {
      marker.setOptions({
        ...options,
        icon: getIconAttributes(color || "#1338BE"),
      });
    }
  }, [marker, options]);

  const getIconAttributes = (iconColor: string) => {
    return {
      path:
        "M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z",
      fillColor: iconColor,
      fillOpacity: 1,
      anchor: new google.maps.Point(9, 26),
      strokeWeight: 1,
      strokeColor: "#ffffff",
      scale: 2,
    };
  };

  return null;
};

export default Marker;
