type HeadProps = {
  cssPath?: string;
};

export const Head = ({ cssPath }: HeadProps) => (
  <head>
    <title>AbsoluteJS AI Chat - React</title>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    {cssPath && <link rel="stylesheet" href={cssPath} />}
  </head>
);
