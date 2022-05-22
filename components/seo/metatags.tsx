import Head from 'next/head';

export const Metatags = (props: {
  title?: string;
  description?: string;
  image?: string;
}) => {
  let title: string;
  let description: string;
  let image: string;

  props.title ? (title = props.title) : (title = 'devlog');
  props.description
    ? (description = props.description)
    : (description = 'The home for developers who blog');
  props.image
    ? (image = props.image)
    : (image =
        'https://www.springboard.com/blog/wp-content/uploads/2019/07/sb-blog-programming.png');

  return (
    <Head>
      <title>{title}</title>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@vinukathejana" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
    </Head>
  );
};
