-- Seed data for lawsuits
INSERT INTO lawsuits (id, name, case_number, court, judge, settlement_info, eligibility_criteria, required_evidence, important_dates, success_metrics, source_info)
VALUES 
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Smith v. TechCorp Data Breach Settlement',
    'CV-2024-12345',
    'U.S. District Court, Northern District of California',
    'Hon. Jane Rodriguez',
    '{
      "total_amount": 75000000,
      "tier_structure": [
        {"tier": "basic", "amount": 250, "requirements": "Account holder during breach period"},
        {"tier": "identity_theft", "amount": 5000, "requirements": "Documented identity theft"},
        {"tier": "financial_loss", "amount": 10000, "requirements": "Documented financial losses"}
      ]
    }',
    '{
      "account_holder": true,
      "breach_period": {"start": "2022-01-01", "end": "2022-06-30"},
      "residence": ["US", "Canada"],
      "exclusions": ["TechCorp employees", "Immediate family of TechCorp executives"]
    }',
    ARRAY['Account statement', 'Identity theft report', 'Financial loss documentation'],
    '{
      "filing_date": "2023-03-15",
      "opt_out_deadline": "2024-06-30",
      "hearing_dates": ["2024-08-15", "2024-09-20"]
    }',
    '{
      "average_payout": 750,
      "approval_rate": 0.85
    }',
    '{
      "url": "https://www.techcorpdatabreach.com",
      "confidence_score": 0.95
    }'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Johnson v. PharmaCo Medication Side Effects',
    'CV-2023-98765',
    'U.S. District Court, Eastern District of Pennsylvania',
    'Hon. Robert Chen',
    '{
      "total_amount": 150000000,
      "tier_structure": [
        {"tier": "minor_effects", "amount": 1500, "requirements": "Documented minor side effects"},
        {"tier": "major_effects", "amount": 25000, "requirements": "Documented major side effects"},
        {"tier": "hospitalization", "amount": 75000, "requirements": "Hospitalization due to side effects"}
      ]
    }',
    '{
      "medication_use": true,
      "usage_period": {"start": "2020-01-01", "end": "2022-12-31"},
      "documented_side_effects": true,
      "exclusions": ["PharmaCo employees", "Participants in clinical trials"]
    }',
    ARRAY['Prescription records', 'Medical records', 'Hospital bills'],
    '{
      "filing_date": "2023-05-20",
      "opt_out_deadline": "2024-07-15",
      "hearing_dates": ["2024-09-10", "2024-10-25"]
    }',
    '{
      "average_payout": 12500,
      "approval_rate": 0.75
    }',
    '{
      "url": "https://www.pharmacosettlement.com",
      "confidence_score": 0.92
    }'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Garcia v. AutoManufacturer Emissions Settlement',
    'CV-2023-54321',
    'U.S. District Court, Southern District of Michigan',
    'Hon. Michael Washington',
    '{
      "total_amount": 350000000,
      "tier_structure": [
        {"tier": "vehicle_owner", "amount": 3500, "requirements": "Current vehicle owner"},
        {"tier": "former_owner", "amount": 1750, "requirements": "Former vehicle owner"},
        {"tier": "lessee", "amount": 1250, "requirements": "Vehicle lessee"}
      ]
    }',
    '{
      "vehicle_ownership": true,
      "eligible_models": ["Sedan X", "SUV Y", "Truck Z"],
      "model_years": ["2018", "2019", "2020", "2021"],
      "exclusions": ["AutoManufacturer employees", "Dealership owners"]
    }',
    ARRAY['Vehicle registration', 'Purchase agreement', 'Lease contract'],
    '{
      "filing_date": "2023-08-10",
      "opt_out_deadline": "2024-08-30",
      "hearing_dates": ["2024-10-15", "2024-11-20"]
    }',
    '{
      "average_payout": 2800,
      "approval_rate": 0.9
    }',
    '{
      "url": "https://www.autoemissionssettlement.com",
      "confidence_score": 0.97
    }'
  );

-- Seed data for defendants
INSERT INTO defendants (id, lawsuit_id, company_name, company_info)
VALUES 
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'TechCorp Inc.',
    '{
      "industry": "Technology",
      "headquarters": "San Francisco, CA",
      "annual_revenue": "25000000000",
      "publicly_traded": true,
      "stock_symbol": "TECH"
    }'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'PharmaCo Laboratories',
    '{
      "industry": "Pharmaceuticals",
      "headquarters": "Philadelphia, PA",
      "annual_revenue": "18000000000",
      "publicly_traded": true,
      "stock_symbol": "PHRM"
    }'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d484',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'AutoManufacturer Group',
    '{
      "industry": "Automotive",
      "headquarters": "Detroit, MI",
      "annual_revenue": "120000000000",
      "publicly_traded": true,
      "stock_symbol": "AUTO"
    }'
  );

-- Seed data for data_sources
INSERT INTO data_sources (id, name, url, reliability_metrics, scraping_config, data_mapping, success_history)
VALUES 
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d485',
    'Class Action Database',
    'https://www.classactiondatabase.com',
    '{
      "accuracy": 0.95,
      "completeness": 0.9,
      "timeliness": 0.85
    }',
    '{
      "selectors": {
        "lawsuit_name": ".case-title",
        "case_number": ".case-number",
        "court": ".court-name",
        "filing_date": ".filing-date"
      },
      "throttling": 5,
      "politeness_delay": 3000
    }',
    '{
      "title": "lawsuit_name",
      "caseNumber": "case_number",
      "courtName": "court",
      "filingDate": "filing_date"
    }',
    '{
      "success_count": 1250,
      "failure_count": 75,
      "last_success": "2024-03-15T10:30:00Z",
      "last_failure": "2024-03-10T14:15:00Z"
    }'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d486',
    'Legal Settlement Tracker',
    'https://www.legalsettlementtracker.com',
    '{
      "accuracy": 0.92,
      "completeness": 0.88,
      "timeliness": 0.9
    }',
    '{
      "selectors": {
        "settlement_name": ".settlement-title",
        "amount": ".settlement-amount",
        "deadline": ".opt-out-deadline",
        "eligibility": ".eligibility-criteria"
      },
      "throttling": 3,
      "politeness_delay": 5000
    }',
    '{
      "title": "settlement_name",
      "settlementAmount": "amount",
      "optOutDeadline": "deadline",
      "eligibilityCriteria": "eligibility"
    }',
    '{
      "success_count": 980,
      "failure_count": 120,
      "last_success": "2024-03-18T09:45:00Z",
      "last_failure": "2024-03-12T11:30:00Z"
    }'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d487',
    'Court Records API',
    'https://api.courtrecords.gov',
    '{
      "accuracy": 0.98,
      "completeness": 0.95,
      "timeliness": 0.8
    }',
    '{
      "selectors": {
        "case_title": "$.case.title",
        "case_number": "$.case.number",
        "court_name": "$.court.name",
        "judge_name": "$.court.judge",
        "filing_date": "$.case.filingDate"
      },
      "throttling": 10,
      "politeness_delay": 1000
    }',
    '{
      "title": "case_title",
      "caseNumber": "case_number",
      "courtName": "court_name",
      "judge": "judge_name",
      "filingDate": "filing_date"
    }',
    '{
      "success_count": 2500,
      "failure_count": 50,
      "last_success": "2024-03-19T16:20:00Z",
      "last_failure": "2024-03-05T08:45:00Z"
    }'
  );
