import React from 'react';

export default function About() {
    return (
        <div style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'left', marginLeft: '25%', marginRight: '25%' }}>
                <div style={{ textAlign: 'left', display: 'flex', justifyContent: 'center', flexDirection: 'column', fontSize:'1.15em' }}>
                    <h1>About</h1>

                    <div style={{ marginTop: '1em' }}>
                        The <b>Food Environment Nutrient Density</b> (FEND) Index was created by researchers
                        at the University of Southern California's Information Sciences Institute and the University of Chile.
                    </div>

                    <div style={{ marginTop: '1em' }}>
                        Researchers developed the Food Environment Nutrient Density Index to provide a better understanding of healthy
                        and unhealthy food sold at restaurants across the US. They wanted to move beyond broad assumptions about nutritional 
                        quality of restaurants, such as "all limited-service restaurants are unhealthy".
                    </div>

                    <div style={{ marginTop: '1em' }}>
                        They collected large-scale data on menus for restaurants across the US, and developed an algorithm to predict
                        the nutrient density of restaurants based on the food sold according to their menus, calling this the
                         "Restaurant Nutrient Density (RND) Index".
                          The algorithm uses large language models and deep learning to predict the nutrient density of any menu item based on its name,
                            and if available, description.
                    </div>
                    <div style={{ marginTop: '1em' }}>
                        To measure the Food Environment Nutrient Density (FEND) Index, the RND Index is aggregated across restaurants within an area and the median is taken.
                    </div>


                    <div style={{ marginTop: '1em' }}>
                        With the RND and FEND Indexes, it is possible to explore accessibility to healthy and unhealthy food at individual restaurants, and across neighborhoods. These tools provide a new lens into disparities in access to healthy food across the US.
                    </div>

                    <div style={{ marginTop: '1em' }}>
                        More about the method can be learned in our article, <a href="https://www.medrxiv.org/content/10.1101/2023.12.08.23299691v1">What's On the Menu? Towards Predicting Nutritional Quality of Food Environments</a>
                    </div>

                    <h2>
                        Team
                    </h2>

                    <div >
                        <div ><img src = "/abigail-pfp.jpg"  alt="" width={120} ></img></div>
                        <a href = "https://abigailhorn.netlify.app/"><b>Abigail Horn</b></a>
                        <br></br>
                        Co-Investigator
                        <br></br>
                        Research Assistant Professor, Industrial and Systems Engineering<br></br>
                        Information Sciences Institute<br></br>
                        USC
                    </div>

                    <p>
                    <div ><img src = "/keith-pfp.jpg" alt="" width={120}></img></div>
                       <a href= "https://www.kburg.co/"><b>Keith Burghardt</b></a> 
                        <br/>
                        Co-Investigator
                        <br/>
                        Computer Scientist
                        <br/>
                        Information Sciences Institute
                        <br/>
                        USC
                    </p>

                    <p>
                    <div ><img src = "/abeliuk-pfp.jpg" alt="" width={120} ></img></div>
                    <a href ="https://aabeliuk.github.io/"> <b>Andrés Abeliuk</b> </a>
                    <br/>
                    Co-Investigator
                    <br/>
                    Assistant Professor of Computer Science
                    <br/>
                    University of Chile
                    </p>

                    <p>
                    <div ><img src = "/kayla-pfp.jpg" alt="" width={120}></img></div>
                    <a href ="https://www.kayladelahaye.net/"> <b>Kayla de la Haye</b> </a>
                    <br/>
                    Co-Investigator
                    <br/>
                    Director, Institute for Food System Equity
                    <br/>
                    Center for Economic and Social Research
                    <br/>
                    USC
                    </p>

                    <p>
                    <div ><img src = "/alex-pfp.jpg" alt="" width={120}></img></div>
                    <a href="https://www.linkedin.com/in/alexdseo"> <b>Alex DongHyeon Seo</b> </a> 
                    <br/>
                    Lead Data Scientist
                    <br/>
                    Masters of Data Science Student
                    <br/>
                    University of Southern California
                    </p>

                    <p>
                    <b>Germán Urrea</b>
                    <br/>
                    Developer
                    <br/>
                    Computer Science Student
                    <br/>
                    University of Chile
                    </p>

                    <h2>
                        Acknowledgements
                    </h2>
                    <p>
                        This work was funded by the National Institute of Minority Health and Health Disparities (NIMHD) of the NIH under award number P50MD017344, to the <a href = "https://socallatinohealth.org/">Southern California Center for Latino Health (SCCLH)</a>.
                    </p>
                    <div style={{display:'flex', direction:'row', justifyContent:'center'}}><img src = "/scclh-pfp.png" alt="" width={480}></img></div>
                    <p>
                    We thank nutrition data company <a style ={{display:'inline'}} href = "https://edamam.com">Edamam</a> for sharing and allowing us to locally store their curated generic meal item data. Edamam is a company with the ambitious goal of organizing all the food knowledge in the world. To that end, it has built a proprietary semantic food knowledge base and is creating a range of consumer and business applications on top of it to solve real-world everyday problems.
                    </p>
                    <div style={{display:'flex', direction:'row', justifyContent:'center'}}><img src = "/edaman-pfp.png" alt="" width={480}></img></div>
                    <p>
                        <a href="https://ph.ucla.edu/about/faculty-staff-directory/may-c-wang">May Wang</a>, Professor of Community Health Sciences at UCLA, contributed.
                    </p>
                    <div style={{display:'flex', direction:'row', justifyContent:'center'}}><img src = "/may-pfp.png" alt="" width={240}></img></div>

                </div>
            </div>
        </div>
    );
}