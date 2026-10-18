/** Sample explainers built from well-known NCI-supported papers and their public deposits. */

export const EXAMPLES_COLLECTION = {
  slug: "nci-landmark-papers",
  title: "NCI Landmark Papers",
  description: "Explainers for well-known NCI-supported studies and the public datasets they deposited.",
}

export const EXAMPLE_ASSETS = [
  {
    id: "ex-tcga-brca-2012",
    pmid: "23000897",
    doi: "10.1038/nature11412",
    paper_url: "https://doi.org/10.1038/nature11412",
    pdf_url: "https://www.nature.com/articles/nature11412.pdf",
    medium: "podcast",
    title: "Molecular portraits of human breast tumours",
    paper_title: "Comprehensive molecular portraits of human breast tumours",
    description:
      "The 2012 TCGA breast cancer study established four main molecular subtypes by combining sequencing, expression, methylation, and protein array data. Those datasets remain available through the Genomic Data Commons (TCGA-BRCA) and dbGaP (phs000569).",
    duration: "12 min",
    author: "The Cancer Genome Atlas Network, 2012",
    outputs: [
      { type: "gdc", id: "TCGA-BRCA", url: "https://portal.gdc.cancer.gov/projects/TCGA-BRCA" },
      { type: "dbgap", id: "phs000569", url: "https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs000569" },
    ],
  },
  {
    id: "ex-tcga-gbm-2008",
    pmid: "18772890",
    doi: "10.1038/nature07385",
    paper_url: "https://doi.org/10.1038/nature07385",
    pdf_url: "https://www.nature.com/articles/nature07385.pdf",
    medium: "ted_talk",
    title: "Core pathways of glioblastoma",
    paper_title: "Comprehensive genomic characterization defines human glioblastoma genes and core pathways",
    description:
      "TCGA’s first marker paper, published in 2008, mapped alterations in the RTK/PI3K, p53, and RB pathways across more than 200 glioblastomas. The cohort is maintained as GDC project TCGA-GBM, with controlled-access approval through dbGaP study phs000178.",
    duration: "10 min",
    author: "The Cancer Genome Atlas Research Network, 2008",
    outputs: [
      { type: "gdc", id: "TCGA-GBM", url: "https://portal.gdc.cancer.gov/projects/TCGA-GBM" },
      { type: "dbgap", id: "phs000178", url: "https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs000178" },
    ],
  },
  {
    id: "ex-cptac-luad-2020",
    pmid: "32649874",
    doi: "10.1016/j.cell.2020.06.013",
    paper_url: "https://doi.org/10.1016/j.cell.2020.06.013",
    medium: "slides",
    title: "Proteogenomic analysis of lung adenocarcinoma",
    paper_title: "Proteogenomic characterization reveals therapeutic vulnerabilities in lung adenocarcinoma",
    description:
      "This CPTAC Cell paper reported matched proteome, phosphoproteome, acetylome, and genomic profiles from lung adenocarcinoma. The mass spectrometry is in the Proteomic Data Commons (PDC000149); genomics are in GDC project CPTAC-3, and the imaging is in the Imaging Data Commons.",
    duration: "12 slides",
    author: "Gillette et al., 2020",
    outputs: [
      { type: "pdc", id: "PDC000149", url: "https://pdc.cancer.gov/pdc/study/PDC000149" },
      { type: "gdc", id: "CPTAC-3", url: "https://portal.gdc.cancer.gov/projects/CPTAC-3" },
      { type: "idc", id: "CPTAC-LUAD", url: "https://portal.imaging.datacommons.cancer.gov/collections/cptac_luad/" },
    ],
  },
  {
    id: "ex-nlst-2011",
    pmid: "21714641",
    doi: "10.1056/NEJMoa1102873",
    paper_url: "https://doi.org/10.1056/NEJMoa1102873",
    medium: "video",
    title: "Low-dose CT screening and lung-cancer mortality",
    paper_title: "Reduced lung-cancer mortality with low-dose computed tomographic screening",
    description:
      "The National Lung Screening Trial showed a 20% reduction in lung-cancer mortality with three annual low-dose CT screens. CT examinations from more than 25,000 participants are publicly available in the NCI Imaging Data Commons.",
    duration: "8 min",
    author: "National Lung Screening Trial Research Team, 2011",
    outputs: [
      { type: "idc", id: "NLST", url: "https://portal.imaging.datacommons.cancer.gov/collections/nlst/" },
    ],
  },
  {
    id: "ex-tirosh-melanoma-2016",
    pmid: "27124452",
    doi: "10.1126/science.aad0501",
    paper_url: "https://doi.org/10.1126/science.aad0501",
    medium: "podcast",
    title: "Single-cell analysis of metastatic melanoma",
    paper_title: "Dissecting the multicellular ecosystem of metastatic melanoma by single-cell RNA-seq",
    description:
      "Tirosh and colleagues profiled 4,645 cells from 19 melanoma tumors, describing MITF-high and AXL-high malignant states and T-cell exhaustion programs. Processed single-cell and bulk RNA-seq data are in GEO (GSE72056).",
    duration: "11 min",
    author: "Tirosh et al., 2016",
    outputs: [
      { type: "geo", id: "GSE72056", url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE72056" },
      { type: "geo", id: "GSE77940", url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE77940" },
    ],
  },
  {
    id: "ex-target-aml-2018",
    pmid: "29227476",
    doi: "10.1038/nm.4439",
    paper_url: "https://doi.org/10.1038/nm.4439",
    medium: "slides",
    title: "The molecular landscape of pediatric AML",
    paper_title: "The molecular landscape of pediatric acute myeloid leukemia reveals recurrent structural alterations and age-specific mutational interactions",
    description:
      "The COG–NCI TARGET AML study characterized nearly 1,000 children on cooperative-group trials and showed that pediatric AML is genetically distinct from adult disease. Individual-level data are in dbGaP (phs000465) and in GDC project TARGET-AML.",
    duration: "10 slides",
    author: "Bolouri et al., 2018",
    outputs: [
      { type: "dbgap", id: "phs000465", url: "https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs000465" },
      { type: "gdc", id: "TARGET-AML", url: "https://portal.gdc.cancer.gov/projects/TARGET-AML" },
    ],
  },
]
