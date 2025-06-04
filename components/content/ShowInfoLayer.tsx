import React, { useEffect, useState } from "react";
import { useGlobalState } from "../../context/GlobalStateContext";
import Divider from "../elements/Divider";
import { getDefaultTourSteps } from "../../context/tourSteps";

export const ShowInfoLayer: React.FC = () => {
  return (
    <>
      <p className="text-sm text-gray-700 mb-4">
        Another type scale tool. Again? No, it's not like that, even if
        typeControl offers type scale as a function, that's not the reason for
        creating this tool.
      </p>
      <p className="text-sm text-gray-700 mt-4">
        It all started with the fact that I wanted to define the letter spacing
        for the font size tokens for a design system in such a way that the
        larger the font size, the smaller the letter spacing. In order to
        achieve visually uniform spacing. In other words, a non-linear letter
        spacing. This means that a definition with percent and pixel value does
        not help here. And of course I wanted to make it dynamic so that not all
        letter spacings have to be redefined when the token is changed. And of
        course css calc() comes to mind. But after several failed attempts I had
        to realize that calc() is defined in such a way that a non-linear
        function is not possible (since no multiplication of values with units
        is possible).
      </p>
      <Divider />
    </>
  );
};
