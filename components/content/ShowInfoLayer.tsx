import React, { useEffect, useState } from "react";
import Divider from "../elements/Divider";

export const ShowInfoLayer: React.FC = () => {
  return (
    <>
      <p className="text-sm text-gray-700 mb-4">
        Another type scale tool. Again? You might think. But, it's not the case,
        even though <i>typeControl</i> offers type scale as a function, that was
        not the reason for creating this tool.
      </p>
      <p className="text-sm text-gray-700 mt-4 mb-4">
        It all started with the fact that I wanted to define the letter spacing
        for the font size tokens for a design system in such a way, that the
        larger the font size, the smaller the letter spacing. To achieve
        visually uniform spacing. In other words: a non-linear letter spacing.
        This means that a definition with percent and pixel value doesn't help
        here. And of course I wanted to make it dynamic so that not all letter
        spacing has to be redefined when the token is changed. And that's
        something where css calc() naturally comes to mind. But after several
        failed attempts, I realized that calc() is defined in such a way that a
        non-linear function is not possible (since no multiplication of values
        with units is possible). So I came up with the idea of developing a tool
        to better control letter spacing. And that was the starting point for{" "}
        <i>typeControl</i>.
      </p>
      <Divider spacing="none" />
    </>
  );
};
