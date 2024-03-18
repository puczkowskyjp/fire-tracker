import { UseQueryResult, useQuery } from "@tanstack/react-query";


interface MicroserviceResponse {
  coordinates: Array<string>;
}
const MICROSERVICE_URL = 'https://kcljksqojsibgdghlpne.supabase.co/functions/v1/get-coordinates';

async function getLocation(locateMe: string) {
  const zip =  {
    zip: locateMe
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(zip)
  };

  try {
    const res = await fetch(MICROSERVICE_URL, options);
    const result: MicroserviceResponse = await res.json();
    if (result) {
      return result;
    } else return undefined;

  } catch (error) {
    console.error(error);
  }
}

const useLocationQuery = (locateMe: string | undefined): UseQueryResult<MicroserviceResponse | undefined, Error>  => {
  return useQuery({
    queryKey: ['location', locateMe],
    enabled: (locateMe && locateMe?.length > 0) ? true : false,
    queryFn: () => getLocation(locateMe!),
  });
}

export default useLocationQuery;