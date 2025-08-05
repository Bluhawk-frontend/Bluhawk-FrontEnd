import React from 'react'

export default function MyIntelInfo() {
    const data = [
      {
        id: '5d7d91eb-a130-4fcd-9508-8c9159f986ad',
        name: 'Latrodectus',
        description:
          '[Latrodectus](https://attack.mitre.org/software/S1160) is a Windows malware downloader that has been used since at least 2023 to download and execute additional payloads and modules. [Latrodectus](https://attack.mitre.org/software/S1160) has most often been distributed through email campaigns, primarily by [TA577](https://attack.mitre.org/groups/G1037) and [TA578](https://attack.mitre.org/groups/G1038), and has infrastructure overlaps with historic [IcedID](https://attack.mitre.org/software/S0483) operations.',
        externalReferences: [
          {
            source_name: 'Bleeping Computer Latrodectus April 2024',
            url: 'https://www.bleepingcomputer.com/news/security/new-latrodectus-malware-attacks-use-microsoft-cloudflare-themes/',
          },
          {
            source_name: 'mitre-attack',
            url: 'https://attack.mitre.org/software/S1160',
          },
          {
            source_name: 'Bitsight Latrodectus June 2024',
            url: 'https://www.bitsight.com/blog/latrodectus-are-you-coming-back',
          },
          {
            source_name: 'AlienVault',
            url: 'https://www.proofpoint.com/us/blog/threat-insight/latrodectus-spider-bytes-ice',
          },
        ],
      },
    ];
    const entity = data[0]; // Access the first entity
    return (
      <div className=" flex items-center justify-center  relative border">
        {/* Subscribe Button */}
        <button className="absolute top-8 right-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
          Subscribe
        </button>
        {/* Container for the entity details card */}
        <div className=" text-white shadow-lg rounded-lg overflow-hidden w-full h-full max-w-none">
          {/* Top Section: ENTITY DETAILS */}
          <div className="p-8 border-b border-gray-700">
            <h1 className="text-3xl font-bold">{entity.name}</h1> {/* Larger font for entity name */}
          </div>
          {/* Description Section */}
          <div className="p-8">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p
              className="text-sm text-gray-300"
              dangerouslySetInnerHTML={{ __html: entity.description }} // Render dynamic description
            ></p>
          </div>
          {/* Threat Report Section */}
          {/* <div className="p-8 border-t border-b border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Threat Report</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              THREAT-REPORT
            </button>
          </div> */}
          {/* External References Section */}
          <div className="p-8">
            <h2 className="text-lg font-semibold mb-2">EXTERNAL REFERENCES</h2>
            <ul className="list-none space-y-2">
              {entity.externalReferences.map((ref, index) => (
                <li key={index}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 underline"
                  >
                    {ref.source_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
