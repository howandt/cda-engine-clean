import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const { id, diagnosis, level, social, structure, stimuli } = req.query;

    const dataPath = path.join(process.cwd(), "public", "CDA", "data", "CDA_PBL_Projects.json");

    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({
        success: false,
        error: `PBL Projects fil ikke fundet: ${dataPath}`
      });
    }

    const raw = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(raw);
    let projects = data.projects;

    // Filter by ID if requested
    if (id) {
      const project = projects.find(p => p.id === id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json({
  success: true,
  total: projects.length,
  results: projects,     // ← nyt felt som GPT læser bedre
  source: projects       // ← behold dit gamle felt for kompatibilitet
});
    }

    // Filter by diagnosis
    if (diagnosis) {
      const diagnosisArray = diagnosis.split(',').map(d => d.trim());
      projects = projects.filter(p => 
        diagnosisArray.some(d => 
          p.diagnosis_match.some(dm => 
            dm.toLowerCase().includes(d.toLowerCase())
          )
        )
      );
    }

    // Filter by level
    if (level) {
      projects = projects.filter(p => 
        p.level.toLowerCase() === level.toLowerCase()
      );
    }

    // Filter by social exposure
    if (social) {
      projects = projects.filter(p => 
        p.social_exposure.toLowerCase() === social.toLowerCase()
      );
    }

    // Filter by structure need
    if (structure) {
      projects = projects.filter(p => 
        p.structure_need.toLowerCase() === structure.toLowerCase()
      );
    }

    // Filter by stimuli type
    if (stimuli) {
      const stimuliArray = stimuli.split(',').map(s => s.trim());
      projects = projects.filter(p => 
        stimuliArray.some(s => 
          p.stimuli_type.some(st => 
            st.toLowerCase().includes(s.toLowerCase())
          )
        )
      );
    }

    // Return filtered results
    return res.status(200).json({
      version: data.version,
      total_projects: data.total_projects,
      filtered_count: projects.length,
      filters_applied: {
        diagnosis: diagnosis || null,
        level: level || null,
        social: social || null,
        structure: structure || null,
        stimuli: stimuli || null
      },
      projects,
      filter_categories: data.filter_categories,
      teacher_templates: data.teacher_templates,
      matching_algorithm: data.matching_algorithm
    });

  } catch (error) {
    console.error('❌ FEJL i /api/pbl-projects:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch PBL projects',
      details: error.message 
    });
  }
}