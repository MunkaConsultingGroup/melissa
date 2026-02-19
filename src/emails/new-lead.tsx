import * as React from 'react';

interface NewLeadEmailProps {
  firstName: string;
  age: number;
  gender: string;
  smokerStatus: string;
  healthClass: string;
  coverageAmount: number;
  termLength: number;
  phone: string;
  email: string;
  zip: string;
  leadId: string;
}

export function NewLeadEmail({
  firstName,
  age,
  gender,
  smokerStatus,
  healthClass,
  coverageAmount,
  termLength,
  phone,
  email,
  zip,
  leadId,
}: NewLeadEmailProps) {
  const coverageFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(coverageAmount);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#334155', fontSize: '24px' }}>New Lead: {firstName}</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <tbody>
          {[
            ['Name', firstName],
            ['Age', String(age)],
            ['Gender', gender],
            ['Smoker', smokerStatus],
            ['Health', healthClass.replace('_', ' ')],
            ['Coverage', coverageFormatted],
            ['Term', `${termLength} years`],
            ['Phone', phone],
            ['Email', email],
            ['ZIP', zip],
          ].map(([label, value]) => (
            <tr key={label}>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#64748b', width: '120px' }}>
                {label}
              </td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8' }}>
        Lead ID: {leadId}
      </p>
    </div>
  );
}
