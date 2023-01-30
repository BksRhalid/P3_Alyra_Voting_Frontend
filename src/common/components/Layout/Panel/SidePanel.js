import { Box, useStyleConfig } from "@chakra-ui/react";
function SidePanel(props) {
  const { variant, children, ...rest } = props;
  const styles = useStyleConfig("Sidepanel", { variant });
  // Pass the computed styles into the `__css` prop
  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  );
}

export default SidePanel;
