import { CERTIFICATIONS, RECOMMENDED_PATH } from '@/data/certifications';

export default function CertificationsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏆 Microsoft Certifications</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Status verified from training data. Always check learn.microsoft.com for the latest.</p>
      </div>

      {/* Recommended path */}
      <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 rounded-xl p-5">
        <h2 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">Recommended Learning Path</h2>
        <div className="flex flex-wrap gap-2 items-center">
          {RECOMMENDED_PATH.map((step, i) => (
            <>
              {i > 0 && <span key={`arrow-${i}`} className="text-indigo-300 dark:text-indigo-700">→</span>}
              <div key={step.code} className="bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 text-sm">
                <div className="font-bold text-indigo-700 dark:text-indigo-300">{step.code}</div>
                <div className="text-xs text-gray-500">{step.timing}</div>
              </div>
            </>
          ))}
        </div>
      </div>

      {/* All certifications */}
      <div className="grid gap-4">
        {CERTIFICATIONS.map(cert => (
          <div key={cert.code} className={`bg-white dark:bg-gray-900 rounded-xl border p-5 ${
            cert.status === 'ACTIVE' ? 'border-gray-200 dark:border-gray-800' :
            'border-red-200 dark:border-red-900 opacity-75'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">{cert.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    cert.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    cert.status === 'RETIRED' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {cert.status}
                  </span>
                  {cert.recommended && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">★ Recommended</span>
                  )}
                </div>
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">{cert.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{cert.description}</p>
                {cert.notes && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-lg">{cert.notes}</p>}
              </div>
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Learn more →
                </a>
              )}
            </div>
            {cert.curriculum_weeks && cert.status === 'ACTIVE' && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400">Covered in curriculum: </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{cert.curriculum_weeks}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
