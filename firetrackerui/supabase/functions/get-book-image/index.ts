// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-client-info, content-type',
}
interface ImageRequest extends Request {
  bookTitle: string;
  orientation?: "all" | "horizontal" | "vertical";
}

interface ImageResponse {
  webformatURL: string;
  largeImageURL: string;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: Array<Hit>;
}

interface Hit {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  collections: number;
  likes: number;
  comments: number;
  user_id: number;
  user: number;
  userImageURL: number;
}

const API_KEY = Deno.env.get("_PIXABAY_API_KEY");
const PIXABAY_URL = Deno.env.get("_PIXABAY_API_URL");
const TAGS: Array<string> = [];
const IMAGE_NOT_FOUND = `${PIXABAY_URL}?key=${API_KEY}&q=frog&image_type=photo`;;

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    
    const imageRequest: ImageRequest = await req.json();
    if (typeof imageRequest.bookTitle !== 'string') {
      throw new Error("Invalid input type for bookTitle!");
    }
    
    if (typeof imageRequest.orientation !== 'string' && typeof imageRequest.orientation !== undefined) {
      throw new Error("Invalid input type for orientation!");
    }
    
    const image = await getPixabayImages(imageRequest);

    if (image) {
      const imageRes: ImageResponse = {
        webformatURL: image.webformatURL,
        largeImageURL: image.largeImageURL
      };
  
      return new Response(
        JSON.stringify(imageRes),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Error fetching photos" }),
        {
          headers: {...corsHeaders},
          status: 500
        }
      );
    }

  } catch (error) {

    if(error instanceof Error) {

      return new Response(
        JSON.stringify({ message: error.message }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    } 
    else {

      return new Response(
        JSON.stringify({ message: "Server Error" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
  }


});

/**
 * A function that searches the string of tags from the
 * Pixabay Response and checks if it contains the desired
 * tags.
 */
function searchTags(tags: string) {
  const tagArray = tags.split(', ');
  let match = false;

  TAGS.forEach(t => {
    tagArray.forEach(ta => {
      if (ta.includes(t)) match = true;
    });
  });

  // tagArray.forEach(tag => {
  //   if(TAGS.includes(tag)) match = true;
  // });

  return match;
}

async function findImages(searchString: string, orientation?: string) {
  const searchArray = searchString.split(' ');
  let index = searchArray.length - 1;
  let images: PixabayResponse | undefined;

  const requestParams: RequestInit = {
    method: 'GET'
  };


  while (index >= 0 && images === undefined) {
    const search = searchArray.length === 1 ? searchArray[0] : searchArray.slice(0, index +1).join(' ').replaceAll(' ', '+');
    const url = `${PIXABAY_URL}?key=${API_KEY}&q=${search}&image_type=photo&orientation=${orientation ?? 'all'}`;
    const res = await fetch(url, requestParams);
    const imagesRes: PixabayResponse = await res.json();
    if (imagesRes.hits.length > 0) {
      images = imagesRes;
      search.split('+').forEach(t => TAGS.push(t.toLowerCase()));

    } else {
      index--;
    }
  }

  return images;
}

async function notFound(request: ImageRequest) {
  const orientation = `&orientation=${request.orientation ?? 'all'}`;
  const notFoundURL = `${IMAGE_NOT_FOUND + orientation}`;

  const notFoundRes = await fetch(notFoundURL, { method: 'GET' });
  const json: PixabayResponse = await notFoundRes.json();
  return json.hits[0];
}

async function getPixabayImages(request: ImageRequest) {
  const searchString = request.bookTitle.replace(/[^a-zA-Z0-9 ]/g, '');

  try {

    if (searchString.length === 0) {
      return await notFound(request);
    }

    const images: PixabayResponse | undefined = await findImages(searchString, request.orientation);

    let image: Hit | undefined;
    if(images !== undefined && (images as PixabayResponse).hits.length > 0) {
      image = (images as PixabayResponse).hits.find(img => searchTags(img.tags));
    } else {
      image = await notFound(request);
    }

    return image;

  } catch (error) {
    throw error;
  }
}



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-book-image' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
