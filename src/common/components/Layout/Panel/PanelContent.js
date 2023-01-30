import { Box, useStyleConfig } from "@chakra-ui/react";

function PanelContent(props) {
  const { variant, children, ...rest } = props;
  // Pass the computed styles into the `__css` prop
  return <Box {...rest}>{children}</Box>;
}

export default PanelContent;
