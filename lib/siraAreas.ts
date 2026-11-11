// Generated from 20260713OnAirSiteReport.xlsx (Physical Site Report).
// This local dataset keeps SIRA SubRegion/District filtering fast and offline.

export type SiraAreaBounds = {
  south: number;
  north: number;
  west: number;
  east: number;
};

export type SiraDistrict = SiraAreaBounds & {
  subRegion: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  siteCount: number;
};

export type SiraSubRegion = SiraAreaBounds & {
  name: string;
  latitude: number;
  longitude: number;
  siteCount: number;
  districts: SiraDistrict[];
};

export type IncidentAreaInput = {
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  address_text?: string | null;
  district?: string | null;
  subregion?: string | null;
};

export const SIRA_SUBREGIONS: SiraSubRegion[] = [
  {
    "name": "Central-1",
    "latitude": 31.5079,
    "longitude": 74.3284,
    "south": 31.368298,
    "north": 31.606448,
    "west": 74.180293,
    "east": 74.487141,
    "siteCount": 1229,
    "districts": [
      {
        "subRegion": "Central-1",
        "name": "Faisalabad",
        "province": "Punjab",
        "latitude": 31.35515,
        "longitude": 73.55878,
        "south": 31.33515,
        "north": 31.37515,
        "west": 73.53878,
        "east": 73.57878,
        "siteCount": 1
      },
      {
        "subRegion": "Central-1",
        "name": "Kasur",
        "province": "Punjab",
        "latitude": 31.179479,
        "longitude": 74.295147,
        "south": 31.113739,
        "north": 31.245219,
        "west": 74.157049,
        "east": 74.433246,
        "siteCount": 2
      },
      {
        "subRegion": "Central-1",
        "name": "Lahore",
        "province": "Punjab",
        "latitude": 31.5079,
        "longitude": 74.32864,
        "south": 31.370344,
        "north": 31.605724,
        "west": 74.183718,
        "east": 74.487209,
        "siteCount": 1223
      },
      {
        "subRegion": "Central-1",
        "name": "Nankana Sahib",
        "province": "Punjab",
        "latitude": 31.730519,
        "longitude": 73.540183,
        "south": 31.647496,
        "north": 31.813541,
        "west": 73.520183,
        "east": 73.560182,
        "siteCount": 2
      },
      {
        "subRegion": "Central-1",
        "name": "Sheikhupura",
        "province": "Punjab",
        "latitude": 31.59594,
        "longitude": 74.2344,
        "south": 31.57594,
        "north": 31.61594,
        "west": 74.2144,
        "east": 74.2544,
        "siteCount": 1
      }
    ]
  },
  {
    "name": "Central-2",
    "latitude": 31.476,
    "longitude": 72.809066,
    "south": 30.852991,
    "north": 32.721386,
    "west": 71.082954,
    "east": 73.445535,
    "siteCount": 1507,
    "districts": [
      {
        "subRegion": "Central-2",
        "name": "Bhakar",
        "province": "Punjab",
        "latitude": 31.60056,
        "longitude": 71.09682,
        "south": 31.58056,
        "north": 31.62056,
        "west": 71.07682,
        "east": 71.11682,
        "siteCount": 1
      },
      {
        "subRegion": "Central-2",
        "name": "Bhakkar",
        "province": "Punjab",
        "latitude": 31.64667,
        "longitude": 71.1465,
        "south": 31.347082,
        "north": 32.164386,
        "west": 70.936751,
        "east": 71.707375,
        "siteCount": 90
      },
      {
        "subRegion": "Central-2",
        "name": "Chiniot",
        "province": "Punjab",
        "latitude": 31.71798,
        "longitude": 72.9677,
        "south": 31.45374,
        "north": 31.852949,
        "west": 72.53933,
        "east": 73.144172,
        "siteCount": 89
      },
      {
        "subRegion": "Central-2",
        "name": "Dera Ismail Khan",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 32.44272,
        "longitude": 71.32598,
        "south": 32.42272,
        "north": 32.46272,
        "west": 71.30598,
        "east": 71.34598,
        "siteCount": 1
      },
      {
        "subRegion": "Central-2",
        "name": "Faisalabad",
        "province": "Punjab",
        "latitude": 31.41552,
        "longitude": 73.09183,
        "south": 30.922814,
        "north": 31.639339,
        "west": 72.830585,
        "east": 73.429934,
        "siteCount": 565
      },
      {
        "subRegion": "Central-2",
        "name": "Faislabad",
        "province": "Punjab",
        "latitude": 31.45188,
        "longitude": 73.269534,
        "south": 30.847848,
        "north": 31.582514,
        "west": 72.938993,
        "east": 73.321917,
        "siteCount": 3
      },
      {
        "subRegion": "Central-2",
        "name": "Hafizabad",
        "province": "Punjab",
        "latitude": 31.90229,
        "longitude": 73.3788,
        "south": 31.79995,
        "north": 32.064215,
        "west": 73.205318,
        "east": 73.612164,
        "siteCount": 33
      },
      {
        "subRegion": "Central-2",
        "name": "Jhang",
        "province": "Punjab",
        "latitude": 31.268665,
        "longitude": 72.31081,
        "south": 30.717742,
        "north": 31.822109,
        "west": 71.797399,
        "east": 72.795874,
        "siteCount": 197
      },
      {
        "subRegion": "Central-2",
        "name": "Khushab",
        "province": "Punjab",
        "latitude": 32.29473,
        "longitude": 72.26385,
        "south": 31.871261,
        "north": 32.640044,
        "west": 71.823016,
        "east": 72.516121,
        "siteCount": 89
      },
      {
        "subRegion": "Central-2",
        "name": "Layyah",
        "province": "Punjab",
        "latitude": 31.325563,
        "longitude": 71.110535,
        "south": 31.305563,
        "north": 31.345563,
        "west": 71.084082,
        "east": 71.136988,
        "siteCount": 2
      },
      {
        "subRegion": "Central-2",
        "name": "Mianwali",
        "province": "Punjab",
        "latitude": 32.58156,
        "longitude": 71.53154,
        "south": 32.23465,
        "north": 32.96409,
        "west": 71.219456,
        "east": 71.8521,
        "siteCount": 101
      },
      {
        "subRegion": "Central-2",
        "name": "Nankana Sahib",
        "province": "Punjab",
        "latitude": 31.77088,
        "longitude": 73.376499,
        "south": 31.716976,
        "north": 31.795234,
        "west": 73.33715,
        "east": 73.378833,
        "siteCount": 3
      },
      {
        "subRegion": "Central-2",
        "name": "Sargodha",
        "province": "Punjab",
        "latitude": 32.0888,
        "longitude": 72.69416,
        "south": 31.793746,
        "north": 32.491637,
        "west": 72.329824,
        "east": 73.183562,
        "siteCount": 230
      },
      {
        "subRegion": "Central-2",
        "name": "Sheikhupura",
        "province": "Punjab",
        "latitude": 31.70939,
        "longitude": 73.4728,
        "south": 31.544924,
        "north": 31.797452,
        "west": 73.352038,
        "east": 73.545642,
        "siteCount": 17
      },
      {
        "subRegion": "Central-2",
        "name": "Toba Tek Singh",
        "province": "Punjab",
        "latitude": 31.01283,
        "longitude": 72.556717,
        "south": 30.796528,
        "north": 31.30009,
        "west": 72.264757,
        "east": 72.777123,
        "siteCount": 86
      }
    ]
  },
  {
    "name": "Central-3",
    "latitude": 30.033504,
    "longitude": 71.38,
    "south": 28.31426,
    "north": 30.968336,
    "west": 70.121134,
    "east": 72.69916,
    "siteCount": 1761,
    "districts": [
      {
        "subRegion": "Central-3",
        "name": "Bahawalnagar",
        "province": "Punjab",
        "latitude": 29.735295,
        "longitude": 72.642505,
        "south": 29.715295,
        "north": 29.755295,
        "west": 72.622505,
        "east": 72.662505,
        "siteCount": 2
      },
      {
        "subRegion": "Central-3",
        "name": "Bahawalpur",
        "province": "Punjab",
        "latitude": 29.38239,
        "longitude": 71.67486,
        "south": 29.067836,
        "north": 29.718646,
        "west": 70.976812,
        "east": 72.560471,
        "siteCount": 195
      },
      {
        "subRegion": "Central-3",
        "name": "Burewala",
        "province": "Punjab",
        "latitude": 30.15855,
        "longitude": 72.6975,
        "south": 30.13855,
        "north": 30.17855,
        "west": 72.6775,
        "east": 72.7175,
        "siteCount": 1
      },
      {
        "subRegion": "Central-3",
        "name": "DG Khan",
        "province": "Punjab",
        "latitude": 29.975985,
        "longitude": 70.629905,
        "south": 29.888697,
        "north": 30.063273,
        "west": 70.544537,
        "east": 70.715273,
        "siteCount": 2
      },
      {
        "subRegion": "Central-3",
        "name": "Dera Ghazi Khan",
        "province": "Punjab",
        "latitude": 30.06089,
        "longitude": 70.64885,
        "south": 29.777823,
        "north": 31.107749,
        "west": 70.324815,
        "east": 70.75402,
        "siteCount": 199
      },
      {
        "subRegion": "Central-3",
        "name": "Gujrat",
        "province": "Punjab",
        "latitude": 30.16429,
        "longitude": 70.95551,
        "south": 30.14429,
        "north": 30.18429,
        "west": 70.93551,
        "east": 70.97551,
        "siteCount": 1
      },
      {
        "subRegion": "Central-3",
        "name": "Jhang",
        "province": "Punjab",
        "latitude": 30.773005,
        "longitude": 72.07842,
        "south": 30.753005,
        "north": 30.793005,
        "west": 72.05587,
        "east": 72.10097,
        "siteCount": 2
      },
      {
        "subRegion": "Central-3",
        "name": "Khanewal",
        "province": "Punjab",
        "latitude": 30.32197,
        "longitude": 71.91782,
        "south": 29.964761,
        "north": 30.673596,
        "west": 71.663348,
        "east": 72.133006,
        "siteCount": 123
      },
      {
        "subRegion": "Central-3",
        "name": "Kot Addu",
        "province": "Punjab",
        "latitude": 30.5519,
        "longitude": 70.98932,
        "south": 30.408509,
        "north": 30.610135,
        "west": 70.946842,
        "east": 71.22989,
        "siteCount": 5
      },
      {
        "subRegion": "Central-3",
        "name": "Layyah",
        "province": "Punjab",
        "latitude": 30.9668,
        "longitude": 70.99699,
        "south": 30.712373,
        "north": 31.261168,
        "west": 70.93198,
        "east": 71.469333,
        "siteCount": 65
      },
      {
        "subRegion": "Central-3",
        "name": "Lodhran",
        "province": "Punjab",
        "latitude": 29.633655,
        "longitude": 71.691452,
        "south": 29.433625,
        "north": 29.899082,
        "west": 71.393835,
        "east": 72.136367,
        "siteCount": 88
      },
      {
        "subRegion": "Central-3",
        "name": "Mandi Bahauddin",
        "province": "Punjab",
        "latitude": 29.448,
        "longitude": 70.59362,
        "south": 29.428,
        "north": 29.468,
        "west": 70.57362,
        "east": 70.61362,
        "siteCount": 1
      },
      {
        "subRegion": "Central-3",
        "name": "Multan",
        "province": "Punjab",
        "latitude": 30.19108,
        "longitude": 71.474115,
        "south": 29.51929,
        "north": 30.320705,
        "west": 71.185235,
        "east": 71.66528,
        "siteCount": 376
      },
      {
        "subRegion": "Central-3",
        "name": "Muzaffargarh",
        "province": "Punjab",
        "latitude": 30.07051,
        "longitude": 70.981576,
        "south": 29.32749,
        "north": 30.592932,
        "west": 70.778972,
        "east": 71.279036,
        "siteCount": 198
      },
      {
        "subRegion": "Central-3",
        "name": "Nankana Sahib",
        "province": "Punjab",
        "latitude": 30.01038,
        "longitude": 71.4889,
        "south": 29.99038,
        "north": 30.03038,
        "west": 71.4689,
        "east": 71.5089,
        "siteCount": 1
      },
      {
        "subRegion": "Central-3",
        "name": "Okara",
        "province": "Punjab",
        "latitude": 30.0131,
        "longitude": 70.6568,
        "south": 29.9931,
        "north": 30.0331,
        "west": 70.6368,
        "east": 70.6768,
        "siteCount": 1
      },
      {
        "subRegion": "Central-3",
        "name": "Rahim Yar Khan",
        "province": "Punjab",
        "latitude": 28.515695,
        "longitude": 70.340375,
        "south": 28.211799,
        "north": 29.098312,
        "west": 69.973818,
        "east": 70.961513,
        "siteCount": 248
      },
      {
        "subRegion": "Central-3",
        "name": "Rahimyar Khan",
        "province": "Punjab",
        "latitude": 28.86576,
        "longitude": 70.67818,
        "south": 28.268474,
        "north": 28.929806,
        "west": 70.272545,
        "east": 71.015683,
        "siteCount": 5
      },
      {
        "subRegion": "Central-3",
        "name": "Rajanpur",
        "province": "Punjab",
        "latitude": 29.345713,
        "longitude": 70.38398,
        "south": 28.685728,
        "north": 29.73392,
        "west": 69.912511,
        "east": 70.607566,
        "siteCount": 67
      },
      {
        "subRegion": "Central-3",
        "name": "Sadiqabad",
        "province": "Punjab",
        "latitude": 28.2731,
        "longitude": 70.0175,
        "south": 28.2531,
        "north": 28.2931,
        "west": 69.9975,
        "east": 70.0375,
        "siteCount": 1
      },
      {
        "subRegion": "Central-3",
        "name": "Sargodha",
        "province": "Punjab",
        "latitude": 29.6807,
        "longitude": 71.6971,
        "south": 29.6607,
        "north": 29.7007,
        "west": 71.6771,
        "east": 71.7171,
        "siteCount": 1
      },
      {
        "subRegion": "Central-3",
        "name": "Shujaabad",
        "province": "Punjab",
        "latitude": 29.869725,
        "longitude": 71.294567,
        "south": 29.849725,
        "north": 29.889725,
        "west": 71.274567,
        "east": 71.314567,
        "siteCount": 1
      },
      {
        "subRegion": "Central-3",
        "name": "Toba Tek Singh",
        "province": "Punjab",
        "latitude": 30.57876,
        "longitude": 72.15881,
        "south": 30.55876,
        "north": 30.59876,
        "west": 72.13881,
        "east": 72.17881,
        "siteCount": 1
      },
      {
        "subRegion": "Central-3",
        "name": "Vehari",
        "province": "Punjab",
        "latitude": 30.06808,
        "longitude": 72.50374,
        "south": 29.71696,
        "north": 30.287288,
        "west": 71.883572,
        "east": 72.84663,
        "siteCount": 177
      }
    ]
  },
  {
    "name": "Central-4",
    "latitude": 30.5255,
    "longitude": 73.0909,
    "south": 29.231615,
    "north": 30.933215,
    "west": 72.253086,
    "east": 73.823742,
    "siteCount": 779,
    "districts": [
      {
        "subRegion": "Central-4",
        "name": "Bahawalnagar",
        "province": "Punjab",
        "latitude": 29.719295,
        "longitude": 73.047915,
        "south": 29.191759,
        "north": 30.203275,
        "west": 72.499306,
        "east": 73.717097,
        "siteCount": 170
      },
      {
        "subRegion": "Central-4",
        "name": "Bahawalpur",
        "province": "Punjab",
        "latitude": 29.54388,
        "longitude": 72.76578,
        "south": 29.52388,
        "north": 29.56388,
        "west": 72.74578,
        "east": 72.78578,
        "siteCount": 1
      },
      {
        "subRegion": "Central-4",
        "name": "Basirpur",
        "province": "Punjab",
        "latitude": 30.5826,
        "longitude": 73.8335,
        "south": 30.5626,
        "north": 30.6026,
        "west": 73.8135,
        "east": 73.8535,
        "siteCount": 1
      },
      {
        "subRegion": "Central-4",
        "name": "Faisalabad",
        "province": "Punjab",
        "latitude": 30.82913,
        "longitude": 72.81061,
        "south": 30.761716,
        "north": 30.91288,
        "west": 72.74684,
        "east": 72.8535,
        "siteCount": 11
      },
      {
        "subRegion": "Central-4",
        "name": "Kamalia",
        "province": "Punjab",
        "latitude": 30.7261,
        "longitude": 72.6361,
        "south": 30.7061,
        "north": 30.7461,
        "west": 72.6161,
        "east": 72.6561,
        "siteCount": 1
      },
      {
        "subRegion": "Central-4",
        "name": "Khanewal",
        "province": "Punjab",
        "latitude": 30.43203,
        "longitude": 72.32198,
        "south": 30.207495,
        "north": 30.525222,
        "west": 72.132147,
        "east": 72.424103,
        "siteCount": 55
      },
      {
        "subRegion": "Central-4",
        "name": "Mian Chunnu",
        "province": "Punjab",
        "latitude": 30.448788,
        "longitude": 72.345551,
        "south": 30.428788,
        "north": 30.468788,
        "west": 72.325551,
        "east": 72.365551,
        "siteCount": 1
      },
      {
        "subRegion": "Central-4",
        "name": "Okara",
        "province": "Punjab",
        "latitude": 30.79877,
        "longitude": 73.52932,
        "south": 30.446689,
        "north": 31.044303,
        "west": 73.317397,
        "east": 73.890304,
        "siteCount": 175
      },
      {
        "subRegion": "Central-4",
        "name": "Pakpattan",
        "province": "Punjab",
        "latitude": 30.3408,
        "longitude": 73.20103,
        "south": 30.13681,
        "north": 30.517158,
        "west": 72.920544,
        "east": 73.546986,
        "siteCount": 99
      },
      {
        "subRegion": "Central-4",
        "name": "Pir Mehal",
        "province": "Punjab",
        "latitude": 30.7484,
        "longitude": 72.4128,
        "south": 30.7284,
        "north": 30.7684,
        "west": 72.3928,
        "east": 72.4328,
        "siteCount": 1
      },
      {
        "subRegion": "Central-4",
        "name": "Sahiwal",
        "province": "Punjab",
        "latitude": 30.618515,
        "longitude": 73.041768,
        "south": 30.317864,
        "north": 30.775976,
        "west": 72.468546,
        "east": 73.302006,
        "siteCount": 197
      },
      {
        "subRegion": "Central-4",
        "name": "Toba Tek Singh",
        "province": "Punjab",
        "latitude": 30.72921,
        "longitude": 72.487205,
        "south": 30.621491,
        "north": 30.838905,
        "west": 72.291085,
        "east": 72.691395,
        "siteCount": 66
      },
      {
        "subRegion": "Central-4",
        "name": "Vehari",
        "province": "Punjab",
        "latitude": 30.24171,
        "longitude": 72.89888,
        "south": 30.22171,
        "north": 30.26171,
        "west": 72.87888,
        "east": 72.91888,
        "siteCount": 1
      }
    ]
  },
  {
    "name": "Central-5",
    "latitude": 32.38981,
    "longitude": 74.182665,
    "south": 31.971768,
    "north": 32.812176,
    "west": 73.288662,
    "east": 75.116179,
    "siteCount": 1322,
    "districts": [
      {
        "subRegion": "Central-5",
        "name": "Gujranwala",
        "province": "Punjab",
        "latitude": 32.157265,
        "longitude": 74.175715,
        "south": 31.924588,
        "north": 32.443013,
        "west": 73.828344,
        "east": 74.384437,
        "siteCount": 412
      },
      {
        "subRegion": "Central-5",
        "name": "Gujrat",
        "province": "Punjab",
        "latitude": 32.641633,
        "longitude": 74.058995,
        "south": 32.474075,
        "north": 32.861076,
        "west": 73.719249,
        "east": 74.389832,
        "siteCount": 278
      },
      {
        "subRegion": "Central-5",
        "name": "Hafizabad",
        "province": "Punjab",
        "latitude": 32.0687,
        "longitude": 73.68913,
        "south": 31.927441,
        "north": 32.214823,
        "west": 73.574,
        "east": 73.796237,
        "siteCount": 33
      },
      {
        "subRegion": "Central-5",
        "name": "Mandi Bahauddin",
        "province": "Punjab",
        "latitude": 32.52403,
        "longitude": 73.4853,
        "south": 32.298671,
        "north": 32.663878,
        "west": 73.198665,
        "east": 73.772498,
        "siteCount": 150
      },
      {
        "subRegion": "Central-5",
        "name": "Mandi Bahaudin",
        "province": "Punjab",
        "latitude": 32.570556,
        "longitude": 73.497695,
        "south": 32.550556,
        "north": 32.590556,
        "west": 73.477695,
        "east": 73.517695,
        "siteCount": 1
      },
      {
        "subRegion": "Central-5",
        "name": "Narowal",
        "province": "Punjab",
        "latitude": 32.2258,
        "longitude": 74.9457,
        "south": 32.015374,
        "north": 32.386336,
        "west": 74.673943,
        "east": 75.270188,
        "siteCount": 113
      },
      {
        "subRegion": "Central-5",
        "name": "Shakargarh",
        "province": "Punjab",
        "latitude": 32.276319,
        "longitude": 75.162524,
        "south": 32.256319,
        "north": 32.296319,
        "west": 75.142524,
        "east": 75.182524,
        "siteCount": 1
      },
      {
        "subRegion": "Central-5",
        "name": "Sialkot",
        "province": "Punjab",
        "latitude": 32.4769,
        "longitude": 74.520585,
        "south": 32.177909,
        "north": 32.629003,
        "west": 74.270792,
        "east": 74.73838,
        "siteCount": 331
      },
      {
        "subRegion": "Central-5",
        "name": "Wazirabad",
        "province": "Punjab",
        "latitude": 32.30002,
        "longitude": 74.10592,
        "south": 32.284161,
        "north": 32.343758,
        "west": 73.767021,
        "east": 74.134278,
        "siteCount": 3
      }
    ]
  },
  {
    "name": "Central-6",
    "latitude": 31.457391,
    "longitude": 74.165267,
    "south": 30.90587,
    "north": 31.85221,
    "west": 73.60573,
    "east": 74.482928,
    "siteCount": 696,
    "districts": [
      {
        "subRegion": "Central-6",
        "name": "Faisalabad",
        "province": "Punjab",
        "latitude": 31.42178,
        "longitude": 73.57034,
        "south": 31.362524,
        "north": 31.4545,
        "west": 73.560413,
        "east": 73.624004,
        "siteCount": 5
      },
      {
        "subRegion": "Central-6",
        "name": "Gujranwala",
        "province": "Punjab",
        "latitude": 31.876,
        "longitude": 73.95487,
        "south": 31.819523,
        "north": 31.880886,
        "west": 73.917555,
        "east": 74.158822,
        "siteCount": 3
      },
      {
        "subRegion": "Central-6",
        "name": "Kasur",
        "province": "Punjab",
        "latitude": 31.116388,
        "longitude": 74.137263,
        "south": 30.826772,
        "north": 31.271609,
        "west": 73.746013,
        "east": 74.492706,
        "siteCount": 199
      },
      {
        "subRegion": "Central-6",
        "name": "Lahore",
        "province": "Punjab",
        "latitude": 31.33143,
        "longitude": 74.215089,
        "south": 31.240905,
        "north": 31.654353,
        "west": 74.062941,
        "east": 74.409558,
        "siteCount": 138
      },
      {
        "subRegion": "Central-6",
        "name": "Nankana Sahib",
        "province": "Punjab",
        "latitude": 31.506065,
        "longitude": 73.70521,
        "south": 31.256223,
        "north": 31.830066,
        "west": 73.549756,
        "east": 73.985185,
        "siteCount": 58
      },
      {
        "subRegion": "Central-6",
        "name": "Okara",
        "province": "Punjab",
        "latitude": 30.985075,
        "longitude": 73.674985,
        "south": 30.924527,
        "north": 31.04316,
        "west": 73.62925,
        "east": 73.71272,
        "siteCount": 4
      },
      {
        "subRegion": "Central-6",
        "name": "Sheikhupura",
        "province": "Punjab",
        "latitude": 31.68337,
        "longitude": 74.1458,
        "south": 31.458672,
        "north": 31.874888,
        "west": 73.696847,
        "east": 74.493284,
        "siteCount": 289
      }
    ]
  },
  {
    "name": "North-1",
    "latitude": 33.7206,
    "longitude": 72.9879,
    "south": 33.293159,
    "north": 34.05371,
    "west": 72.177625,
    "east": 73.957439,
    "siteCount": 1153,
    "districts": [
      {
        "subRegion": "North-1",
        "name": "Abbottabad",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.04947,
        "longitude": 73.16356,
        "south": 33.860589,
        "north": 34.121635,
        "west": 73.102477,
        "east": 73.340397,
        "siteCount": 36
      },
      {
        "subRegion": "North-1",
        "name": "Attock",
        "province": "Punjab",
        "latitude": 33.772825,
        "longitude": 72.43094,
        "south": 33.217957,
        "north": 33.947514,
        "west": 72.013318,
        "east": 72.788635,
        "siteCount": 252
      },
      {
        "subRegion": "North-1",
        "name": "Bagh",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.89941,
        "longitude": 73.77868,
        "south": 33.87941,
        "north": 33.91941,
        "west": 73.75868,
        "east": 73.79868,
        "siteCount": 1
      },
      {
        "subRegion": "North-1",
        "name": "Haripur",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 33.991605,
        "longitude": 72.92772,
        "south": 33.782463,
        "north": 34.083518,
        "west": 72.804123,
        "east": 73.12326,
        "siteCount": 114
      },
      {
        "subRegion": "North-1",
        "name": "Islamabad",
        "province": "Capital Territory",
        "latitude": 33.671975,
        "longitude": 73.05776,
        "south": 33.606527,
        "north": 33.74885,
        "west": 72.830306,
        "east": 73.227066,
        "siteCount": 460
      },
      {
        "subRegion": "North-1",
        "name": "Kotli",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.4997,
        "longitude": 73.9575,
        "south": 33.319221,
        "north": 33.601474,
        "west": 73.676549,
        "east": 74.103449,
        "siteCount": 43
      },
      {
        "subRegion": "North-1",
        "name": "Muzaffarabad",
        "province": "Azad Jammu and Kashmir",
        "latitude": 34.04207,
        "longitude": 73.49207,
        "south": 34.02207,
        "north": 34.06207,
        "west": 73.47207,
        "east": 73.51207,
        "siteCount": 1
      },
      {
        "subRegion": "North-1",
        "name": "Pallandari",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.72344,
        "longitude": 73.69443,
        "south": 33.70344,
        "north": 33.74344,
        "west": 73.67443,
        "east": 73.71443,
        "siteCount": 1
      },
      {
        "subRegion": "North-1",
        "name": "Poonch",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.83683,
        "longitude": 73.7921,
        "south": 33.683976,
        "north": 33.921073,
        "west": 73.62783,
        "east": 73.978014,
        "siteCount": 47
      },
      {
        "subRegion": "North-1",
        "name": "Rawalakot",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.882801,
        "longitude": 73.768747,
        "south": 33.860684,
        "north": 33.904918,
        "west": 73.748747,
        "east": 73.788747,
        "siteCount": 2
      },
      {
        "subRegion": "North-1",
        "name": "Rawalpindi",
        "province": "Punjab",
        "latitude": 33.76569,
        "longitude": 72.82105,
        "south": 33.586344,
        "north": 33.981791,
        "west": 72.713716,
        "east": 73.519021,
        "siteCount": 155
      },
      {
        "subRegion": "North-1",
        "name": "Sudhnoti",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.7022,
        "longitude": 73.7683,
        "south": 33.602586,
        "north": 33.807106,
        "west": 73.609955,
        "east": 73.872093,
        "siteCount": 33
      },
      {
        "subRegion": "North-1",
        "name": "Taxila",
        "province": "Punjab",
        "latitude": 33.77433,
        "longitude": 72.80521,
        "south": 33.741605,
        "north": 33.792876,
        "west": 72.736308,
        "east": 72.854202,
        "siteCount": 7
      },
      {
        "subRegion": "North-1",
        "name": "Wah Cantt",
        "province": "Punjab",
        "latitude": 33.73726,
        "longitude": 72.71498,
        "south": 33.71726,
        "north": 33.75726,
        "west": 72.69498,
        "east": 72.73498,
        "siteCount": 1
      }
    ]
  },
  {
    "name": "North-2",
    "latitude": 33.98569,
    "longitude": 71.53143,
    "south": 31.825738,
    "north": 34.28374,
    "west": 70.345132,
    "east": 72.195702,
    "siteCount": 1411,
    "districts": [
      {
        "subRegion": "North-2",
        "name": "Bannu",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 32.97311,
        "longitude": 70.613045,
        "south": 32.844394,
        "north": 33.0257,
        "west": 70.002496,
        "east": 70.917943,
        "siteCount": 92
      },
      {
        "subRegion": "North-2",
        "name": "Charsadda",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.193635,
        "longitude": 71.73207,
        "south": 34.096392,
        "north": 34.366361,
        "west": 71.459989,
        "east": 71.863262,
        "siteCount": 148
      },
      {
        "subRegion": "North-2",
        "name": "DI Khan",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 31.945684,
        "longitude": 70.809991,
        "south": 31.731361,
        "north": 32.183673,
        "west": 70.479306,
        "east": 70.970194,
        "siteCount": 4
      },
      {
        "subRegion": "North-2",
        "name": "Dera Ismail Khan",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 31.85187,
        "longitude": 70.89285,
        "south": 31.545,
        "north": 32.386384,
        "west": 70.352568,
        "east": 71.229274,
        "siteCount": 91
      },
      {
        "subRegion": "North-2",
        "name": "Hangu",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 33.52301,
        "longitude": 71.0056,
        "south": 33.333098,
        "north": 33.789006,
        "west": 70.51735,
        "east": 71.154058,
        "siteCount": 41
      },
      {
        "subRegion": "North-2",
        "name": "Karak",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 33.116505,
        "longitude": 71.07482,
        "south": 32.949077,
        "north": 33.301852,
        "west": 70.874748,
        "east": 71.337365,
        "siteCount": 58
      },
      {
        "subRegion": "North-2",
        "name": "Khyber",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.01715,
        "longitude": 71.36411,
        "south": 33.89506,
        "north": 34.113959,
        "west": 71.108842,
        "east": 71.459458,
        "siteCount": 13
      },
      {
        "subRegion": "North-2",
        "name": "Khyber Agency",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 33.93966,
        "longitude": 71.37217,
        "south": 33.907486,
        "north": 34.017352,
        "west": 71.35609,
        "east": 71.452002,
        "siteCount": 5
      },
      {
        "subRegion": "North-2",
        "name": "Kohat",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 33.56626,
        "longitude": 71.457533,
        "south": 33.238488,
        "north": 33.685842,
        "west": 71.191654,
        "east": 71.845746,
        "siteCount": 99
      },
      {
        "subRegion": "North-2",
        "name": "Kurram",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 33.72824,
        "longitude": 70.29588,
        "south": 33.507929,
        "north": 33.933467,
        "west": 69.939276,
        "east": 70.378523,
        "siteCount": 17
      },
      {
        "subRegion": "North-2",
        "name": "Lakki Marwat",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 32.61008,
        "longitude": 70.82327,
        "south": 32.297642,
        "north": 32.830482,
        "west": 70.610972,
        "east": 71.008766,
        "siteCount": 71
      },
      {
        "subRegion": "North-2",
        "name": "Mardan",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.05535,
        "longitude": 71.98793,
        "south": 34.031859,
        "north": 34.091408,
        "west": 71.553952,
        "east": 72.045981,
        "siteCount": 3
      },
      {
        "subRegion": "North-2",
        "name": "Nowshehra",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 33.909519,
        "longitude": 71.943711,
        "south": 33.820535,
        "north": 33.998502,
        "west": 71.805115,
        "east": 72.082306,
        "siteCount": 2
      },
      {
        "subRegion": "North-2",
        "name": "Nowshera",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.00752,
        "longitude": 71.979202,
        "south": 33.810332,
        "north": 34.094512,
        "west": 71.720233,
        "east": 72.220324,
        "siteCount": 164
      },
      {
        "subRegion": "North-2",
        "name": "Peshawar",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.00609,
        "longitude": 71.55771,
        "south": 33.799559,
        "north": 34.133741,
        "west": 71.39257,
        "east": 71.69783,
        "siteCount": 567
      },
      {
        "subRegion": "North-2",
        "name": "Swabi",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 33.9952,
        "longitude": 72.28236,
        "south": 33.964002,
        "north": 34.048577,
        "west": 72.160091,
        "east": 72.353184,
        "siteCount": 19
      },
      {
        "subRegion": "North-2",
        "name": "Tank",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 32.21181,
        "longitude": 70.396797,
        "south": 32.081877,
        "north": 32.400617,
        "west": 70.25952,
        "east": 70.581637,
        "siteCount": 17
      }
    ]
  },
  {
    "name": "North-3",
    "latitude": 34.387955,
    "longitude": 72.414355,
    "south": 33.9965,
    "north": 36.096041,
    "west": 71.579613,
    "east": 74.624402,
    "siteCount": 1480,
    "districts": [
      {
        "subRegion": "North-3",
        "name": "Abbottabad",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.17677,
        "longitude": 73.23929,
        "south": 34.013606,
        "north": 34.361201,
        "west": 73.122473,
        "east": 73.467303,
        "siteCount": 127
      },
      {
        "subRegion": "North-3",
        "name": "Astore",
        "province": "Gilgit Baltistan",
        "latitude": 35.3617,
        "longitude": 74.84959,
        "south": 35.294058,
        "north": 35.63818,
        "west": 74.635136,
        "east": 74.85632,
        "siteCount": 3
      },
      {
        "subRegion": "North-3",
        "name": "Attock",
        "province": "Punjab",
        "latitude": 33.967884,
        "longitude": 72.57984,
        "south": 33.947884,
        "north": 33.987884,
        "west": 72.55984,
        "east": 72.59984,
        "siteCount": 1
      },
      {
        "subRegion": "North-3",
        "name": "Bagh",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.998585,
        "longitude": 73.703835,
        "south": 33.9207,
        "north": 34.08265,
        "west": 73.524448,
        "east": 73.897509,
        "siteCount": 44
      },
      {
        "subRegion": "North-3",
        "name": "Bajaur",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.777365,
        "longitude": 71.51355,
        "south": 34.664332,
        "north": 34.891267,
        "west": 71.340677,
        "east": 71.651,
        "siteCount": 34
      },
      {
        "subRegion": "North-3",
        "name": "Bajaur Agency",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.71389,
        "longitude": 71.44585,
        "south": 34.69389,
        "north": 34.73389,
        "west": 71.42585,
        "east": 71.46585,
        "siteCount": 1
      },
      {
        "subRegion": "North-3",
        "name": "Batagram",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.68074,
        "longitude": 73.0208,
        "south": 34.570374,
        "north": 34.837232,
        "west": 72.933188,
        "east": 73.130796,
        "siteCount": 15
      },
      {
        "subRegion": "North-3",
        "name": "Buner",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.49985,
        "longitude": 72.48443,
        "south": 34.223029,
        "north": 34.61546,
        "west": 72.256796,
        "east": 72.645726,
        "siteCount": 57
      },
      {
        "subRegion": "North-3",
        "name": "Charsadda",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.213378,
        "longitude": 71.904765,
        "south": 34.144724,
        "north": 34.353285,
        "west": 71.83363,
        "east": 72.023443,
        "siteCount": 6
      },
      {
        "subRegion": "North-3",
        "name": "Chitral",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 35.85023,
        "longitude": 71.78649,
        "south": 35.737626,
        "north": 36.239252,
        "west": 71.773491,
        "east": 72.219661,
        "siteCount": 5
      },
      {
        "subRegion": "North-3",
        "name": "Diamer",
        "province": "Gilgit Baltistan",
        "latitude": 35.41275,
        "longitude": 74.21995,
        "south": 35.40168,
        "north": 35.62944,
        "west": 73.508775,
        "east": 74.48972,
        "siteCount": 6
      },
      {
        "subRegion": "North-3",
        "name": "Ghanche",
        "province": "Gilgit Baltistan",
        "latitude": 35.1789,
        "longitude": 76.0783,
        "south": 35.163828,
        "north": 35.236884,
        "west": 75.939484,
        "east": 76.326268,
        "siteCount": 3
      },
      {
        "subRegion": "North-3",
        "name": "Ghizer",
        "province": "Gilgit Baltistan",
        "latitude": 36.216185,
        "longitude": 73.802,
        "south": 36.067212,
        "north": 36.502362,
        "west": 73.284656,
        "east": 74.073818,
        "siteCount": 12
      },
      {
        "subRegion": "North-3",
        "name": "Gilgit",
        "province": "Gilgit Baltistan",
        "latitude": 35.91821,
        "longitude": 74.357735,
        "south": 35.611878,
        "north": 36.295436,
        "west": 73.860655,
        "east": 74.897028,
        "siteCount": 42
      },
      {
        "subRegion": "North-3",
        "name": "Haripur",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.00807,
        "longitude": 72.69234,
        "south": 33.956449,
        "north": 34.043312,
        "west": 72.656036,
        "east": 72.765176,
        "siteCount": 7
      },
      {
        "subRegion": "North-3",
        "name": "Hattian Bala",
        "province": "Azad Jammu and Kashmir",
        "latitude": 34.17344,
        "longitude": 73.7411,
        "south": 34.141146,
        "north": 34.225124,
        "west": 73.670868,
        "east": 73.8498,
        "siteCount": 9
      },
      {
        "subRegion": "North-3",
        "name": "Hunza",
        "province": "Gilgit Baltistan",
        "latitude": 36.31305,
        "longitude": 74.65675,
        "south": 36.233636,
        "north": 36.638684,
        "west": 74.34958,
        "east": 74.859404,
        "siteCount": 8
      },
      {
        "subRegion": "North-3",
        "name": "Kohistan",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 35.2615,
        "longitude": 73.22185,
        "south": 35.2415,
        "north": 35.2815,
        "west": 73.20185,
        "east": 73.24185,
        "siteCount": 2
      },
      {
        "subRegion": "North-3",
        "name": "Lower Dir",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.83872,
        "longitude": 71.85081,
        "south": 34.673218,
        "north": 34.974669,
        "west": 71.619651,
        "east": 72.114169,
        "siteCount": 115
      },
      {
        "subRegion": "North-3",
        "name": "Malakand",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.547695,
        "longitude": 71.930605,
        "south": 34.388515,
        "north": 34.669629,
        "west": 71.804413,
        "east": 72.107329,
        "siteCount": 58
      },
      {
        "subRegion": "North-3",
        "name": "Mansehra",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.40611,
        "longitude": 73.2049,
        "south": 34.259173,
        "north": 34.647821,
        "west": 72.986274,
        "east": 73.434973,
        "siteCount": 173
      },
      {
        "subRegion": "North-3",
        "name": "Mardan",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.221508,
        "longitude": 72.04189,
        "south": 34.12773,
        "north": 34.459842,
        "west": 71.863736,
        "east": 72.283328,
        "siteCount": 273
      },
      {
        "subRegion": "North-3",
        "name": "Muzaffarabad",
        "province": "Azad Jammu and Kashmir",
        "latitude": 34.3552,
        "longitude": 73.49003,
        "south": 34.132357,
        "north": 34.501476,
        "west": 73.453046,
        "east": 73.725451,
        "siteCount": 57
      },
      {
        "subRegion": "North-3",
        "name": "Nagar",
        "province": "Gilgit Baltistan",
        "latitude": 36.23944,
        "longitude": 74.445329,
        "south": 36.219114,
        "north": 36.259114,
        "west": 74.395381,
        "east": 74.486101,
        "siteCount": 3
      },
      {
        "subRegion": "North-3",
        "name": "Nowshera",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.11943,
        "longitude": 72.01746,
        "south": 34.108856,
        "north": 34.190493,
        "west": 71.931454,
        "east": 72.21197,
        "siteCount": 5
      },
      {
        "subRegion": "North-3",
        "name": "Peshawar",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.134965,
        "longitude": 72.10513,
        "south": 34.104221,
        "north": 34.165709,
        "west": 72.082205,
        "east": 72.128055,
        "siteCount": 2
      },
      {
        "subRegion": "North-3",
        "name": "Poonch",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.97595,
        "longitude": 73.61095,
        "south": 33.950827,
        "north": 33.994814,
        "west": 73.58479,
        "east": 73.867856,
        "siteCount": 3
      },
      {
        "subRegion": "North-3",
        "name": "Rawalakot",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.91218,
        "longitude": 73.72806,
        "south": 33.89218,
        "north": 33.93218,
        "west": 73.70806,
        "east": 73.74806,
        "siteCount": 1
      },
      {
        "subRegion": "North-3",
        "name": "Rawalpindi",
        "province": "Punjab",
        "latitude": 33.96918,
        "longitude": 73.39035,
        "south": 33.94918,
        "north": 33.98918,
        "west": 73.37035,
        "east": 73.41035,
        "siteCount": 1
      },
      {
        "subRegion": "North-3",
        "name": "Shangla",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.9251,
        "longitude": 72.878,
        "south": 34.9051,
        "north": 34.9451,
        "west": 72.858,
        "east": 72.898,
        "siteCount": 1
      },
      {
        "subRegion": "North-3",
        "name": "Skardu",
        "province": "Gilgit Baltistan",
        "latitude": 35.2958,
        "longitude": 75.61411,
        "south": 35.281756,
        "north": 35.679516,
        "west": 75.268268,
        "east": 75.719956,
        "siteCount": 15
      },
      {
        "subRegion": "North-3",
        "name": "Swabi",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.125738,
        "longitude": 72.46421,
        "south": 34.02915,
        "north": 34.269075,
        "west": 72.227337,
        "east": 72.688032,
        "siteCount": 162
      },
      {
        "subRegion": "North-3",
        "name": "Swat",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.826407,
        "longitude": 72.3675,
        "south": 34.649506,
        "north": 35.450311,
        "west": 72.06217,
        "east": 72.594276,
        "siteCount": 179
      },
      {
        "subRegion": "North-3",
        "name": "Timergara",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 34.84137,
        "longitude": 71.80162,
        "south": 34.82137,
        "north": 34.86137,
        "west": 71.78162,
        "east": 71.82162,
        "siteCount": 1
      },
      {
        "subRegion": "North-3",
        "name": "Upper Dir",
        "province": "Khyber Pakhtunkhwa",
        "latitude": 35.086665,
        "longitude": 71.99476,
        "south": 34.75198,
        "north": 35.228979,
        "west": 71.759479,
        "east": 72.109709,
        "siteCount": 49
      }
    ]
  },
  {
    "name": "North-4",
    "latitude": 33.44893,
    "longitude": 73.09883,
    "south": 32.706784,
    "north": 33.643088,
    "west": 72.308871,
    "east": 73.954438,
    "siteCount": 1210,
    "districts": [
      {
        "subRegion": "North-4",
        "name": "Bhimber",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.02256,
        "longitude": 74.06071,
        "south": 32.87155,
        "north": 33.207856,
        "west": 73.896734,
        "east": 74.245636,
        "siteCount": 27
      },
      {
        "subRegion": "North-4",
        "name": "Chakwal",
        "province": "Punjab",
        "latitude": 32.928325,
        "longitude": 72.759768,
        "south": 32.678397,
        "north": 33.146574,
        "west": 71.978948,
        "east": 73.124482,
        "siteCount": 186
      },
      {
        "subRegion": "North-4",
        "name": "Gujrat",
        "province": "Punjab",
        "latitude": 32.9068,
        "longitude": 73.7679,
        "south": 32.779059,
        "north": 32.982725,
        "west": 73.628209,
        "east": 73.894383,
        "siteCount": 19
      },
      {
        "subRegion": "North-4",
        "name": "Islamabad",
        "province": "Capital Territory",
        "latitude": 33.56396,
        "longitude": 73.162385,
        "south": 33.481418,
        "north": 33.624459,
        "west": 72.945707,
        "east": 73.27779,
        "siteCount": 78
      },
      {
        "subRegion": "North-4",
        "name": "Jehlum",
        "province": "Punjab",
        "latitude": 33.03389,
        "longitude": 73.685661,
        "south": 32.93282,
        "north": 33.134435,
        "west": 73.424504,
        "east": 73.732344,
        "siteCount": 7
      },
      {
        "subRegion": "North-4",
        "name": "Jhelum",
        "province": "Punjab",
        "latitude": 32.9727,
        "longitude": 73.6149,
        "south": 32.57952,
        "north": 33.165556,
        "west": 72.912195,
        "east": 73.860866,
        "siteCount": 123
      },
      {
        "subRegion": "North-4",
        "name": "Kotli",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.341,
        "longitude": 73.8718,
        "south": 33.251152,
        "north": 33.42254,
        "west": 73.776232,
        "east": 73.95178,
        "siteCount": 11
      },
      {
        "subRegion": "North-4",
        "name": "Mandi Bahauddin",
        "province": "Punjab",
        "latitude": 32.651,
        "longitude": 73.223,
        "south": 32.631,
        "north": 32.671,
        "west": 73.203,
        "east": 73.243,
        "siteCount": 1
      },
      {
        "subRegion": "North-4",
        "name": "Mirpur",
        "province": "Azad Jammu and Kashmir",
        "latitude": 33.151806,
        "longitude": 73.7614,
        "south": 33.014186,
        "north": 33.406168,
        "west": 73.631428,
        "east": 73.94495,
        "siteCount": 77
      },
      {
        "subRegion": "North-4",
        "name": "Rawalpindi",
        "province": "Punjab",
        "latitude": 33.574495,
        "longitude": 73.07575,
        "south": 33.177909,
        "north": 33.647585,
        "west": 72.874805,
        "east": 73.484371,
        "siteCount": 678
      },
      {
        "subRegion": "North-4",
        "name": "Talagang",
        "province": "Punjab",
        "latitude": 32.89049,
        "longitude": 72.23023,
        "south": 32.705561,
        "north": 32.930407,
        "west": 71.952537,
        "east": 72.414492,
        "siteCount": 3
      }
    ]
  },
  {
    "name": "South-1",
    "latitude": 24.905535,
    "longitude": 67.07341,
    "south": 24.805966,
    "north": 25.047437,
    "west": 66.88785,
    "east": 67.336614,
    "siteCount": 2070,
    "districts": [
      {
        "subRegion": "South-1",
        "name": "Karachi",
        "province": "Sindh",
        "latitude": 24.955241,
        "longitude": 67.125939,
        "south": 24.853781,
        "north": 25.041934,
        "west": 67.029196,
        "east": 67.466618,
        "siteCount": 3
      },
      {
        "subRegion": "South-1",
        "name": "Karachi Central",
        "province": "Sindh",
        "latitude": 24.94466,
        "longitude": 67.05862,
        "south": 24.896491,
        "north": 25.004384,
        "west": 67.02193,
        "east": 67.089582,
        "siteCount": 310
      },
      {
        "subRegion": "South-1",
        "name": "Karachi East",
        "province": "Sindh",
        "latitude": 24.90827,
        "longitude": 67.09224,
        "south": 24.843716,
        "north": 25.005188,
        "west": 67.031916,
        "east": 67.16558,
        "siteCount": 391
      },
      {
        "subRegion": "South-1",
        "name": "Karachi South",
        "province": "Sindh",
        "latitude": 24.84616,
        "longitude": 67.02615,
        "south": 24.786682,
        "north": 24.955808,
        "west": 66.98406,
        "east": 67.106882,
        "siteCount": 259
      },
      {
        "subRegion": "South-1",
        "name": "Karachi West",
        "province": "Sindh",
        "latitude": 24.946665,
        "longitude": 66.993715,
        "south": 24.852002,
        "north": 25.052873,
        "west": 66.899017,
        "east": 67.156759,
        "siteCount": 468
      },
      {
        "subRegion": "South-1",
        "name": "Korangi",
        "province": "Sindh",
        "latitude": 24.83943,
        "longitude": 67.1541,
        "south": 24.808251,
        "north": 24.904515,
        "west": 67.097498,
        "east": 67.197053,
        "siteCount": 269
      },
      {
        "subRegion": "South-1",
        "name": "Lasbela",
        "province": "Balochistan",
        "latitude": 25.034165,
        "longitude": 66.87517,
        "south": 24.97432,
        "north": 25.186162,
        "west": 66.701662,
        "east": 66.910308,
        "siteCount": 46
      },
      {
        "subRegion": "South-1",
        "name": "Malir",
        "province": "Sindh",
        "latitude": 24.868125,
        "longitude": 67.220005,
        "south": 24.797869,
        "north": 25.089505,
        "west": 67.107373,
        "east": 67.41993,
        "siteCount": 324
      }
    ]
  },
  {
    "name": "South-2",
    "latitude": 25.40301,
    "longitude": 68.41376,
    "south": 24.43441,
    "north": 26.4051,
    "west": 67.59081,
    "east": 69.72874,
    "siteCount": 1001,
    "districts": [
      {
        "subRegion": "South-2",
        "name": "Badin",
        "province": "Sindh",
        "latitude": 24.73197,
        "longitude": 68.812058,
        "south": 24.444098,
        "north": 25.196926,
        "west": 68.422487,
        "east": 69.16115,
        "siteCount": 65
      },
      {
        "subRegion": "South-2",
        "name": "Hyderabad",
        "province": "Sindh",
        "latitude": 25.390129,
        "longitude": 68.37012,
        "south": 25.29389,
        "north": 25.458659,
        "west": 68.321518,
        "east": 68.548925,
        "siteCount": 254
      },
      {
        "subRegion": "South-2",
        "name": "Jamshoro",
        "province": "Sindh",
        "latitude": 25.36781,
        "longitude": 68.27579,
        "south": 25.124965,
        "north": 25.58678,
        "west": 67.579746,
        "east": 68.319591,
        "siteCount": 57
      },
      {
        "subRegion": "South-2",
        "name": "Karachi West",
        "province": "Sindh",
        "latitude": 25.95927,
        "longitude": 68.89349,
        "south": 25.93927,
        "north": 25.97927,
        "west": 68.87349,
        "east": 68.91349,
        "siteCount": 1
      },
      {
        "subRegion": "South-2",
        "name": "Malir",
        "province": "Sindh",
        "latitude": 25.45886,
        "longitude": 68.446143,
        "south": 25.43886,
        "north": 25.47886,
        "west": 68.426143,
        "east": 68.466143,
        "siteCount": 1
      },
      {
        "subRegion": "South-2",
        "name": "Matiari",
        "province": "Sindh",
        "latitude": 25.80469,
        "longitude": 68.44822,
        "south": 25.474075,
        "north": 26.028329,
        "west": 68.364109,
        "east": 68.576788,
        "siteCount": 33
      },
      {
        "subRegion": "South-2",
        "name": "Mirpur Khas",
        "province": "Sindh",
        "latitude": 25.50973,
        "longitude": 69.02366,
        "south": 24.897961,
        "north": 25.58565,
        "west": 68.92462,
        "east": 69.33853,
        "siteCount": 85
      },
      {
        "subRegion": "South-2",
        "name": "Nawabshah",
        "province": "Sindh",
        "latitude": 26.237548,
        "longitude": 68.367992,
        "south": 26.129066,
        "north": 26.324723,
        "west": 68.089762,
        "east": 68.682475,
        "siteCount": 20
      },
      {
        "subRegion": "South-2",
        "name": "Sanghar",
        "province": "Sindh",
        "latitude": 25.89175,
        "longitude": 68.72505,
        "south": 25.645237,
        "north": 26.168798,
        "west": 68.558444,
        "east": 69.442961,
        "siteCount": 119
      },
      {
        "subRegion": "South-2",
        "name": "Shaheed Benazir Abad",
        "province": "Sindh",
        "latitude": 26.24652,
        "longitude": 68.3888,
        "south": 26.024251,
        "north": 26.578436,
        "west": 68.050335,
        "east": 68.627834,
        "siteCount": 125
      },
      {
        "subRegion": "South-2",
        "name": "Sujawal",
        "province": "Sindh",
        "latitude": 24.60725,
        "longitude": 68.09395,
        "south": 24.206491,
        "north": 24.991344,
        "west": 67.91018,
        "east": 68.473741,
        "siteCount": 25
      },
      {
        "subRegion": "South-2",
        "name": "Tando Allahyar",
        "province": "Sindh",
        "latitude": 25.4613,
        "longitude": 68.71916,
        "south": 25.27018,
        "north": 25.6205,
        "west": 68.61829,
        "east": 68.90635,
        "siteCount": 51
      },
      {
        "subRegion": "South-2",
        "name": "Tando Muhammad Khan",
        "province": "Sindh",
        "latitude": 25.1231,
        "longitude": 68.53914,
        "south": 24.849667,
        "north": 25.25168,
        "west": 68.317747,
        "east": 68.824403,
        "siteCount": 37
      },
      {
        "subRegion": "South-2",
        "name": "Tharparkar",
        "province": "Sindh",
        "latitude": 24.70607,
        "longitude": 70.29416,
        "south": 24.490244,
        "north": 24.79022,
        "west": 69.325124,
        "east": 70.394035,
        "siteCount": 7
      },
      {
        "subRegion": "South-2",
        "name": "Thatta",
        "province": "Sindh",
        "latitude": 24.74316,
        "longitude": 67.888555,
        "south": 24.159062,
        "north": 25.303354,
        "west": 67.482953,
        "east": 68.238608,
        "siteCount": 84
      },
      {
        "subRegion": "South-2",
        "name": "Umerkot",
        "province": "Sindh",
        "latitude": 25.3653,
        "longitude": 69.57842,
        "south": 25.119391,
        "north": 25.588632,
        "west": 69.24573,
        "east": 69.790846,
        "siteCount": 37
      }
    ]
  },
  {
    "name": "South-3",
    "latitude": 30.16786,
    "longitude": 66.98672,
    "south": 25.214674,
    "north": 31.335506,
    "west": 62.252105,
    "east": 69.444273,
    "siteCount": 939,
    "districts": [
      {
        "subRegion": "South-3",
        "name": "Awaran",
        "province": "Balochistan",
        "latitude": 26.78136,
        "longitude": 65.39372,
        "south": 26.466643,
        "north": 27.096077,
        "west": 65.236309,
        "east": 65.551131,
        "siteCount": 2
      },
      {
        "subRegion": "South-3",
        "name": "Chagai",
        "province": "Balochistan",
        "latitude": 28.9423,
        "longitude": 64.40015,
        "south": 28.758167,
        "north": 29.332463,
        "west": 61.570405,
        "east": 64.661725,
        "siteCount": 10
      },
      {
        "subRegion": "South-3",
        "name": "Dalbadin",
        "province": "Balochistan",
        "latitude": 28.887909,
        "longitude": 64.424373,
        "south": 28.867909,
        "north": 28.907909,
        "west": 64.404373,
        "east": 64.444373,
        "siteCount": 1
      },
      {
        "subRegion": "South-3",
        "name": "Gawader",
        "province": "Balochistan",
        "latitude": 25.17586,
        "longitude": 62.32456,
        "south": 25.050022,
        "north": 25.621944,
        "west": 61.748766,
        "east": 64.625962,
        "siteCount": 31
      },
      {
        "subRegion": "South-3",
        "name": "Harnai",
        "province": "Balochistan",
        "latitude": 30.15321,
        "longitude": 67.81966,
        "south": 30.105412,
        "north": 30.201008,
        "west": 67.70709,
        "east": 67.93223,
        "siteCount": 2
      },
      {
        "subRegion": "South-3",
        "name": "Jacobabad",
        "province": "Balochistan",
        "latitude": 28.44533,
        "longitude": 68.42734,
        "south": 28.42533,
        "north": 28.46533,
        "west": 68.40734,
        "east": 68.44734,
        "siteCount": 1
      },
      {
        "subRegion": "South-3",
        "name": "Jaffarabad",
        "province": "Balochistan",
        "latitude": 28.18515,
        "longitude": 68.06445,
        "south": 27.99947,
        "north": 28.501462,
        "west": 67.755192,
        "east": 68.9641,
        "siteCount": 31
      },
      {
        "subRegion": "South-3",
        "name": "Jhal Magsi",
        "province": "Balochistan",
        "latitude": 28.444445,
        "longitude": 67.535925,
        "south": 27.974689,
        "north": 28.819511,
        "west": 67.379796,
        "east": 67.71259,
        "siteCount": 22
      },
      {
        "subRegion": "South-3",
        "name": "Kachhi",
        "province": "Balochistan",
        "latitude": 29.252855,
        "longitude": 67.651815,
        "south": 28.896891,
        "north": 29.862282,
        "west": 67.324523,
        "east": 67.951112,
        "siteCount": 14
      },
      {
        "subRegion": "South-3",
        "name": "Kalat",
        "province": "Balochistan",
        "latitude": 29.02314,
        "longitude": 66.584251,
        "south": 28.325743,
        "north": 29.310268,
        "west": 66.263097,
        "east": 66.630848,
        "siteCount": 9
      },
      {
        "subRegion": "South-3",
        "name": "Kech",
        "province": "Balochistan",
        "latitude": 26.000915,
        "longitude": 63.02381,
        "south": 25.574516,
        "north": 26.325861,
        "west": 62.125605,
        "east": 64.383632,
        "siteCount": 42
      },
      {
        "subRegion": "South-3",
        "name": "Kharan",
        "province": "Balochistan",
        "latitude": 28.58066,
        "longitude": 65.42149,
        "south": 28.56066,
        "north": 28.60066,
        "west": 65.40149,
        "east": 65.44149,
        "siteCount": 2
      },
      {
        "subRegion": "South-3",
        "name": "Khuzdar",
        "province": "Balochistan",
        "latitude": 27.80431,
        "longitude": 66.605195,
        "south": 27.163831,
        "north": 28.037876,
        "west": 66.138092,
        "east": 67.031931,
        "siteCount": 14
      },
      {
        "subRegion": "South-3",
        "name": "Killa Abdullah",
        "province": "Balochistan",
        "latitude": 30.911665,
        "longitude": 66.474385,
        "south": 30.559563,
        "north": 30.937753,
        "west": 66.414936,
        "east": 66.799386,
        "siteCount": 80
      },
      {
        "subRegion": "South-3",
        "name": "Killa Saifullah",
        "province": "Balochistan",
        "latitude": 30.7281,
        "longitude": 68.2468,
        "south": 30.689845,
        "north": 30.870212,
        "west": 67.556122,
        "east": 68.928368,
        "siteCount": 27
      },
      {
        "subRegion": "South-3",
        "name": "Kohlu",
        "province": "Balochistan",
        "latitude": 29.89546,
        "longitude": 69.25068,
        "south": 29.875383,
        "north": 29.915383,
        "west": 69.222619,
        "east": 69.273442,
        "siteCount": 3
      },
      {
        "subRegion": "South-3",
        "name": "Lasbela",
        "province": "Balochistan",
        "latitude": 25.82744,
        "longitude": 66.57223,
        "south": 25.381438,
        "north": 28.451585,
        "west": 66.284514,
        "east": 66.674306,
        "siteCount": 28
      },
      {
        "subRegion": "South-3",
        "name": "Lehri",
        "province": "Balochistan",
        "latitude": 28.94139,
        "longitude": 67.881885,
        "south": 28.727043,
        "north": 29.209647,
        "west": 67.701407,
        "east": 68.198938,
        "siteCount": 14
      },
      {
        "subRegion": "South-3",
        "name": "Loralai",
        "province": "Balochistan",
        "latitude": 30.371725,
        "longitude": 68.591014,
        "south": 30.01955,
        "north": 30.43388,
        "west": 68.45101,
        "east": 69.365244,
        "siteCount": 32
      },
      {
        "subRegion": "South-3",
        "name": "Mastung",
        "province": "Balochistan",
        "latitude": 29.81408,
        "longitude": 66.8468,
        "south": 29.596046,
        "north": 30.00274,
        "west": 66.741113,
        "east": 67.10796,
        "siteCount": 18
      },
      {
        "subRegion": "South-3",
        "name": "Nasirabad",
        "province": "Balochistan",
        "latitude": 28.5398,
        "longitude": 68.19894,
        "south": 28.287845,
        "north": 28.895152,
        "west": 67.772666,
        "east": 68.356487,
        "siteCount": 30
      },
      {
        "subRegion": "South-3",
        "name": "Nushki",
        "province": "Balochistan",
        "latitude": 29.55198,
        "longitude": 66.01088,
        "south": 29.410915,
        "north": 29.587108,
        "west": 65.939529,
        "east": 66.021369,
        "siteCount": 8
      },
      {
        "subRegion": "South-3",
        "name": "Panjgur",
        "province": "Balochistan",
        "latitude": 26.938703,
        "longitude": 64.073425,
        "south": 26.52865,
        "north": 27.10445,
        "west": 63.34618,
        "east": 65.02232,
        "siteCount": 26
      },
      {
        "subRegion": "South-3",
        "name": "Pishin",
        "province": "Balochistan",
        "latitude": 30.59037,
        "longitude": 67.01048,
        "south": 30.386821,
        "north": 30.750106,
        "west": 66.842234,
        "east": 67.356553,
        "siteCount": 57
      },
      {
        "subRegion": "South-3",
        "name": "Quetta",
        "province": "Balochistan",
        "latitude": 30.184362,
        "longitude": 66.98954,
        "south": 30.076703,
        "north": 30.364,
        "west": 66.898847,
        "east": 67.039171,
        "siteCount": 386
      },
      {
        "subRegion": "South-3",
        "name": "Sibi",
        "province": "Balochistan",
        "latitude": 29.54721,
        "longitude": 67.87723,
        "south": 29.530034,
        "north": 29.59219,
        "west": 67.857904,
        "east": 68.105858,
        "siteCount": 11
      },
      {
        "subRegion": "South-3",
        "name": "Washuk",
        "province": "Balochistan",
        "latitude": 27.41891,
        "longitude": 64.80772,
        "south": 27.18804,
        "north": 27.709176,
        "west": 64.516965,
        "east": 65.119528,
        "siteCount": 3
      },
      {
        "subRegion": "South-3",
        "name": "Zhob",
        "province": "Balochistan",
        "latitude": 31.33824,
        "longitude": 69.449802,
        "south": 31.239013,
        "north": 31.355378,
        "west": 69.359029,
        "east": 69.576493,
        "siteCount": 30
      },
      {
        "subRegion": "South-3",
        "name": "Ziarat",
        "province": "Balochistan",
        "latitude": 30.38159,
        "longitude": 67.73345,
        "south": 30.264697,
        "north": 30.483097,
        "west": 67.390992,
        "east": 68.311138,
        "siteCount": 5
      }
    ]
  },
  {
    "name": "South-4",
    "latitude": 27.63713,
    "longitude": 68.51321,
    "south": 26.429657,
    "north": 28.377922,
    "west": 67.690948,
    "east": 69.687372,
    "siteCount": 875,
    "districts": [
      {
        "subRegion": "South-4",
        "name": "Dadu",
        "province": "Sindh",
        "latitude": 26.73681,
        "longitude": 67.77455,
        "south": 26.616379,
        "north": 27.206731,
        "west": 67.400632,
        "east": 67.952348,
        "siteCount": 83
      },
      {
        "subRegion": "South-4",
        "name": "Dera Bugti",
        "province": "Sindh",
        "latitude": 28.63438,
        "longitude": 69.188,
        "south": 28.613945,
        "north": 28.653945,
        "west": 69.172806,
        "east": 69.212806,
        "siteCount": 5
      },
      {
        "subRegion": "South-4",
        "name": "Ghotki",
        "province": "Sindh",
        "latitude": 28.01588,
        "longitude": 69.41714,
        "south": 27.771442,
        "north": 28.295497,
        "west": 69.167026,
        "east": 69.814236,
        "siteCount": 77
      },
      {
        "subRegion": "South-4",
        "name": "Goth Ibrahim Jatoi",
        "province": "Sindh",
        "latitude": 27.463054,
        "longitude": 68.211466,
        "south": 27.443054,
        "north": 27.483054,
        "west": 68.191466,
        "east": 68.231466,
        "siteCount": 1
      },
      {
        "subRegion": "South-4",
        "name": "Jacobabad",
        "province": "Sindh",
        "latitude": 28.27164,
        "longitude": 68.45072,
        "south": 27.991114,
        "north": 28.38493,
        "west": 68.019092,
        "east": 68.88048,
        "siteCount": 61
      },
      {
        "subRegion": "South-4",
        "name": "Jamshoro",
        "province": "Sindh",
        "latitude": 26.42307,
        "longitude": 67.86138,
        "south": 25.763786,
        "north": 26.56063,
        "west": 67.717616,
        "east": 68.284969,
        "siteCount": 25
      },
      {
        "subRegion": "South-4",
        "name": "Johi",
        "province": "Sindh",
        "latitude": 26.695143,
        "longitude": 67.613351,
        "south": 26.675143,
        "north": 26.715143,
        "west": 67.593351,
        "east": 67.633351,
        "siteCount": 1
      },
      {
        "subRegion": "South-4",
        "name": "Kambar",
        "province": "Sindh",
        "latitude": 27.58773,
        "longitude": 68.00233,
        "south": 27.55174,
        "north": 27.59468,
        "west": 67.890586,
        "east": 68.006084,
        "siteCount": 3
      },
      {
        "subRegion": "South-4",
        "name": "Kashmore",
        "province": "Sindh",
        "latitude": 28.249445,
        "longitude": 69.182815,
        "south": 28.098508,
        "north": 28.445738,
        "west": 68.928884,
        "east": 69.675458,
        "siteCount": 50
      },
      {
        "subRegion": "South-4",
        "name": "Khairpur",
        "province": "Sindh",
        "latitude": 27.49537,
        "longitude": 68.626505,
        "south": 26.868286,
        "north": 27.637068,
        "west": 68.319126,
        "east": 68.79141,
        "siteCount": 102
      },
      {
        "subRegion": "South-4",
        "name": "Larkana",
        "province": "Sindh",
        "latitude": 27.55757,
        "longitude": 68.20982,
        "south": 27.310884,
        "north": 27.799454,
        "west": 67.919913,
        "east": 68.359445,
        "siteCount": 119
      },
      {
        "subRegion": "South-4",
        "name": "Lasbela",
        "province": "Sindh",
        "latitude": 27.177108,
        "longitude": 67.948503,
        "south": 27.157108,
        "north": 27.197108,
        "west": 67.928503,
        "east": 67.968503,
        "siteCount": 1
      },
      {
        "subRegion": "South-4",
        "name": "Matiari",
        "province": "Sindh",
        "latitude": 25.746935,
        "longitude": 68.291497,
        "south": 25.726935,
        "north": 25.766935,
        "west": 68.271497,
        "east": 68.311497,
        "siteCount": 1
      },
      {
        "subRegion": "South-4",
        "name": "Moro",
        "province": "Sindh",
        "latitude": 26.675334,
        "longitude": 68.000067,
        "south": 26.655334,
        "north": 26.695334,
        "west": 67.980067,
        "east": 68.020067,
        "siteCount": 1
      },
      {
        "subRegion": "South-4",
        "name": "Naushahro Feroze",
        "province": "Sindh",
        "latitude": 26.94049,
        "longitude": 68.21244,
        "south": 26.59717,
        "north": 27.177469,
        "west": 67.971993,
        "east": 68.431433,
        "siteCount": 70
      },
      {
        "subRegion": "South-4",
        "name": "Nawabshah",
        "province": "Sindh",
        "latitude": 26.551497,
        "longitude": 67.988526,
        "south": 26.531497,
        "north": 26.571497,
        "west": 67.968526,
        "east": 68.008526,
        "siteCount": 1
      },
      {
        "subRegion": "South-4",
        "name": "Qambar Shahdadkot",
        "province": "Sindh",
        "latitude": 27.60266,
        "longitude": 67.958737,
        "south": 27.380036,
        "north": 27.881019,
        "west": 67.711186,
        "east": 68.173809,
        "siteCount": 53
      },
      {
        "subRegion": "South-4",
        "name": "Shahdadkot",
        "province": "Sindh",
        "latitude": 27.72491,
        "longitude": 67.9007,
        "south": 27.382538,
        "north": 27.856494,
        "west": 67.869981,
        "east": 68.05649,
        "siteCount": 7
      },
      {
        "subRegion": "South-4",
        "name": "Shaheed Benazir Abad",
        "province": "Sindh",
        "latitude": 26.497005,
        "longitude": 67.988485,
        "south": 26.456831,
        "north": 26.586839,
        "west": 67.971276,
        "east": 68.169217,
        "siteCount": 4
      },
      {
        "subRegion": "South-4",
        "name": "Shikarpur",
        "province": "Sindh",
        "latitude": 27.952507,
        "longitude": 68.6392,
        "south": 27.762785,
        "north": 28.139593,
        "west": 68.345045,
        "east": 68.852812,
        "siteCount": 60
      },
      {
        "subRegion": "South-4",
        "name": "Sukkur",
        "province": "Sindh",
        "latitude": 27.702765,
        "longitude": 68.866425,
        "south": 27.391727,
        "north": 27.86638,
        "west": 68.766824,
        "east": 69.159901,
        "siteCount": 150
      }
    ]
  }
] as SiraSubRegion[];

export function normalizeSiraAreaText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getSiraSubRegion(name: string | null | undefined) {
  const target = normalizeSiraAreaText(name);
  return SIRA_SUBREGIONS.find(
    (item) => normalizeSiraAreaText(item.name) === target
  ) ?? null;
}

export function getSiraDistricts(subRegion: string | null | undefined) {
  return getSiraSubRegion(subRegion)?.districts ?? [];
}

function distanceSquared(
  latitude: number,
  longitude: number,
  area: Pick<SiraDistrict, "latitude" | "longitude">
) {
  const latScale = Math.cos((latitude * Math.PI) / 180);
  const dx = (longitude - area.longitude) * latScale;
  const dy = latitude - area.latitude;
  return dx * dx + dy * dy;
}

function closestArea(
  candidates: SiraDistrict[],
  latitude: number,
  longitude: number
) {
  if (!candidates.length) return null;

  return candidates.reduce((best, item) =>
    distanceSquared(latitude, longitude, item) <
    distanceSquared(latitude, longitude, best)
      ? item
      : best
  );
}

export function inferSiraArea(input: IncidentAreaInput): SiraDistrict | null {
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const hasCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= 23 &&
    latitude <= 38 &&
    longitude >= 60 &&
    longitude <= 78;

  const allDistricts = SIRA_SUBREGIONS.flatMap((item) => item.districts);
  const explicitSubRegion = normalizeSiraAreaText(input.subregion);
  const explicitDistrict = normalizeSiraAreaText(input.district);
  const locationText = normalizeSiraAreaText(
    [input.district, input.city, input.address_text].filter(Boolean).join(" ")
  );

  let candidates = allDistricts;

  if (explicitSubRegion) {
    const subRegionCandidates = candidates.filter(
      (item) => normalizeSiraAreaText(item.subRegion) === explicitSubRegion
    );
    if (subRegionCandidates.length) candidates = subRegionCandidates;
  }

  if (explicitDistrict) {
    const exactDistricts = candidates.filter(
      (item) => normalizeSiraAreaText(item.name) === explicitDistrict
    );
    if (exactDistricts.length) candidates = exactDistricts;
  } else if (locationText) {
    const namedDistricts = candidates.filter((item) => {
      const districtName = normalizeSiraAreaText(item.name);
      return districtName.length >= 3 && locationText.includes(districtName);
    });

    if (namedDistricts.length) candidates = namedDistricts;
  }

  if (hasCoordinates) {
    return closestArea(candidates, latitude, longitude);
  }

  return candidates[0] ?? null;
}

// ---- Regions (same helpers as the Android app) -----------------------------

// The box that covers every area given.
export function unionSiraBounds(areas: SiraAreaBounds[]): SiraAreaBounds | null {
  if (!areas.length) return null;
  return {
    south: Math.min(...areas.map((item) => item.south)),
    north: Math.max(...areas.map((item) => item.north)),
    west: Math.min(...areas.map((item) => item.west)),
    east: Math.max(...areas.map((item) => item.east)),
  };
}

// A SubRegion's own box does not always contain all of its districts, so the
// zoom area also covers each district's box.
export function getSiraSubRegionBounds(name: string | null | undefined) {
  const subRegion = getSiraSubRegion(name);
  return subRegion ? unionSiraBounds([subRegion, ...subRegion.districts]) : null;
}

export type SiraRegion = SiraAreaBounds & {
  name: string;
  subRegions: SiraSubRegion[];
  districtCount: number;
};

// Regions are the SubRegion name prefix: "Central-3" belongs to "Central".
export function getSiraRegionName(subRegion: string | null | undefined) {
  return String(subRegion ?? "").split("-")[0].trim();
}

export const SIRA_REGIONS: SiraRegion[] = Array.from(
  new Set(SIRA_SUBREGIONS.map((item) => getSiraRegionName(item.name)))
).map((name) => {
  const subRegions = SIRA_SUBREGIONS.filter((item) => getSiraRegionName(item.name) === name);
  const districts = subRegions.flatMap((item) => item.districts);
  return {
    name,
    subRegions,
    districtCount: districts.length,
    ...unionSiraBounds([...subRegions, ...districts])!,
  };
});

export function getSiraRegion(name: string | null | undefined) {
  const target = normalizeSiraAreaText(name);
  return SIRA_REGIONS.find((item) => normalizeSiraAreaText(item.name) === target) ?? null;
}
